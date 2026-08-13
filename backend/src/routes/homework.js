import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";
import { getVisionModel, geminiEnabled, extractJson } from "../services/gemini.js";
import { retrieveContext, formatContextForPrompt } from "../services/rag.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Envie uma imagem (foto do dever)."));
    cb(null, true);
  }
});

export const homeworkRouter = Router();

homeworkRouter.post("/analyze", upload.single("photo"), async (req, res) => {
  const { student = "Sofia", subject } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Envie uma foto do dever no campo 'photo'." });
  }

  try {
    const analysis = geminiEnabled
      ? await analyzeWithGemini(req.file.path, subject)
      : mockAnalysis(subject);

    const matchedAgenda = findAgendaMatchForToday(analysis.subject || subject);

    const insert = db.prepare(`
      INSERT INTO homework_submissions
        (student, subject, image_path, transcribed_text, correct_count, wrong_count, explanation_student, explanation_parent, matched_agenda_id, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      student,
      analysis.subject || subject || null,
      req.file.path,
      analysis.transcribed_text || null,
      analysis.correct_count ?? null,
      analysis.wrong_count ?? null,
      analysis.explanation_student || null,
      analysis.explanation_parent || null,
      matchedAgenda?.id ?? null,
      geminiEnabled ? "gemini" : "mock"
    );

    res.json({
      id: result.lastInsertRowid,
      matchedAgenda: matchedAgenda || null,
      ...analysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao analisar o dever de casa.", details: error.message });
  }
});

homeworkRouter.get("/history", (req, res) => {
  const student = req.query.student || "Sofia";
  const rows = db
    .prepare("SELECT * FROM homework_submissions WHERE student = ? ORDER BY created_at DESC LIMIT 50")
    .all(student);
  res.json(rows);
});

async function analyzeWithGemini(imagePath, subjectHint) {
  const model = getVisionModel();
  const imageBase64 = fs.readFileSync(imagePath).toString("base64");
  const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  // Primeiro passo: transcrever e identificar matéria/tópico para poder buscar o material certo.
  const triagePrompt = `Você recebeu a foto de um dever de casa de uma criança do ensino fundamental.
Transcreva o conteúdo (perguntas e respostas escritas pela criança) e identifique a matéria escolar e o tópico principal.
Responda em JSON: {"transcribed_text": "...", "subject": "...", "topic": "..."}`;

  const triageResult = await model.generateContent([
    triagePrompt,
    { inlineData: { data: imageBase64, mimeType } }
  ]);
  const triage = extractJson(triageResult.response.text());

  const subject = triage.subject || subjectHint || "Geral";
  const contextChunks = await retrieveContext(`${subject} ${triage.topic || ""}`, { subject });
  const context = formatContextForPrompt(contextChunks);

  const gradingPrompt = `Você é um tutor particular gentil e didático para uma criança do ensino fundamental.
Material didático de referência (use isso para embasar sua correção e explicação, citando o mesmo vocabulário do livro quando possível):
---
${context}
---

Dever de casa transcrito da foto:
---
${triage.transcribed_text}
---

Corrija o dever com base no material de referência. Responda SOMENTE em JSON com este formato exato:
{
  "subject": "matéria identificada",
  "topic": "tópico específico",
  "transcribed_text": "transcrição do dever",
  "correct_count": número de itens corretos,
  "wrong_count": número de itens errados,
  "explanation_student": "explicação simples e encorajadora para a criança, em 2-3 frases, sobre onde errou e como corrigir",
  "explanation_parent": "resumo objetivo para o responsável: o que foi bem, o que precisa de reforço, e uma sugestão prática de 10-15 min para ajudar"
}`;

  const gradingResult = await model.generateContent(gradingPrompt);
  return extractJson(gradingResult.response.text());
}

function mockAnalysis(subject) {
  return {
    subject: subject || "Matemática",
    topic: "Frações",
    transcribed_text: "(modo demonstração — configure GEMINI_API_KEY para análise real)",
    correct_count: 7,
    wrong_count: 3,
    explanation_student: "Primeiro encontre um denominador comum. Depois some apenas os numeradores.",
    explanation_parent: "Revise com exemplos de pizza, dinheiro e divisão de objetos por 15 minutos."
  };
}

function findAgendaMatchForToday(subject) {
  if (!subject) return null;
  const today = new Date().toISOString().slice(0, 10);
  return db
    .prepare("SELECT * FROM agenda WHERE subject = ? AND date = ?")
    .get(subject, today);
}
