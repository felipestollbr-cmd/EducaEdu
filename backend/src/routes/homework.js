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
  const mode = req.body.mode === "socratic" ? "socratic" : "correct";

  if (!req.file) {
    return res.status(400).json({ error: "Envie uma foto do dever no campo 'photo'." });
  }

  try {
    const analysis = geminiEnabled
      ? await analyzeWithGemini(req.file.path, subject, mode)
      : mockAnalysis(subject, mode);

    const matchedAgenda = findAgendaMatchForToday(analysis.subject || subject);

    const insert = db.prepare(`
      INSERT INTO homework_submissions
        (student, subject, image_path, transcribed_text, mode, correct_count, wrong_count, explanation_student, explanation_parent, guiding_question, hint, matched_agenda_id, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      student,
      analysis.subject || subject || null,
      req.file.path,
      analysis.transcribed_text || null,
      mode,
      analysis.correct_count ?? null,
      analysis.wrong_count ?? null,
      analysis.explanation_student || null,
      analysis.explanation_parent || null,
      analysis.guiding_question || null,
      analysis.hint || null,
      matchedAgenda?.id ?? null,
      geminiEnabled ? "gemini" : "mock"
    );

    res.json({
      id: result.lastInsertRowid,
      mode,
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

async function analyzeWithGemini(imagePath, subjectHint, mode) {
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

  const gradingResult = await model.generateContent(
    mode === "socratic"
      ? buildSocraticPrompt(context, triage)
      : buildCorrectionPrompt(context, triage)
  );
  return extractJson(gradingResult.response.text());
}

function buildCorrectionPrompt(context, triage) {
  return `Você é um tutor particular gentil e didático para uma criança do ensino fundamental.
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
}

function buildSocraticPrompt(context, triage) {
  return `Você é um tutor socrático para uma criança do ensino fundamental: em vez de entregar a resposta
pronta, você guia o raciocínio dela com uma pergunta bem escolhida, para que ela mesma chegue à explicação.

Material didático de referência (use o mesmo vocabulário do livro quando possível):
---
${context}
---

Dever de casa transcrito da foto:
---
${triage.transcribed_text}
---

NÃO corrija nem dê a resposta certa diretamente. Em vez disso, responda SOMENTE em JSON com este formato exato:
{
  "subject": "matéria identificada",
  "topic": "tópico específico",
  "transcribed_text": "transcrição do dever",
  "guiding_question": "uma pergunta curta e concreta que ajude a criança a perceber sozinha onde revisar o raciocínio, sem entregar a resposta",
  "hint": "uma dica sutil (1 frase) para o caso de ela travar na pergunta, ainda sem dar a resposta final"
}`;
}

function mockAnalysis(subject, mode) {
  if (mode === "socratic") {
    return {
      subject: subject || "Matemática",
      topic: "Frações",
      transcribed_text: "(modo demonstração — configure GEMINI_API_KEY para análise real)",
      guiding_question: "Antes de somar, os dois denominadores são iguais? O que precisa acontecer para poder somar os numeradores direto?",
      hint: "Pense em transformar as duas frações para que fiquem com o mesmo denominador."
    };
  }
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
