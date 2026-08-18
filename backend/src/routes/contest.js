import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";
import { getTextModel, geminiEnabled, extractJson } from "../services/gemini.js";
import { retrieveContext, formatContextForPrompt } from "../services/rag.js";
import { ingestPdfBuffer } from "../services/ingest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const materialsDir = path.join(__dirname, "..", "..", "uploads", "materials");
fs.mkdirSync(materialsDir, { recursive: true });

const uploadMaterial = multer({
  storage: multer.diskStorage({
    destination: materialsDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Envie um PDF (edital ou material de estudo)."));
    cb(null, true);
  }
});

export const contestRouter = Router();

// POST /api/contest/materials — sobe o edital ou material de estudo (PDF) de um concurso.
// O conteúdo é quebrado em trechos e vira base de RAG: /api/contest/exam e o estudo do dia
// passam a embasar as perguntas nesse material em vez de conhecimento genérico.
contestRouter.post("/materials", uploadMaterial.single("file"), async (req, res) => {
  const { subject, title } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Envie um arquivo PDF no campo 'file'." });
  }
  if (!subject) {
    return res.status(400).json({ error: "Informe o concurso/matéria (campo 'subject')." });
  }
  if (!geminiEnabled) {
    return res.status(400).json({
      error: "Configure GEMINI_API_KEY no backend para poder processar materiais de estudo."
    });
  }

  try {
    const buffer = fs.readFileSync(req.file.path);
    const bookName = title || req.file.originalname;
    const { chunkCount } = await ingestPdfBuffer(buffer, bookName, subject);
    res.status(201).json({ subject, title: bookName, chunkCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao processar o material.", details: error.message });
  }
});

contestRouter.get("/materials", (req, res) => {
  const subject = req.query.subject;
  const rows = subject
    ? db.prepare("SELECT book, subject, COUNT(*) as chunks, MIN(id) as id FROM book_chunks WHERE subject = ? GROUP BY book, subject").all(subject)
    : db.prepare("SELECT book, subject, COUNT(*) as chunks, MIN(id) as id FROM book_chunks GROUP BY book, subject").all();
  res.json(rows);
});

const mockQuestions = [
  {
    prompt: "No RGPS, qualidade de segurado e carência são conceitos equivalentes.",
    answer: "Errado",
    explanation: "Qualidade de segurado indica vínculo/proteção; carência é o número mínimo de contribuições para certos benefícios."
  },
  {
    prompt: "Em bancos relacionais, uma chave primária identifica unicamente cada registro de uma tabela.",
    answer: "Certo",
    explanation: "A chave primária evita duplicidade na identificação e serve como referência para relacionamentos."
  },
  {
    prompt: "No modelo Cebraspe, uma resposta errada pode anular uma resposta certa, quando previsto no edital.",
    answer: "Certo",
    explanation: "Esse formato exige estratégia: responder com segurança e evitar chutes quando a penalização estiver ativa."
  }
];

// GET /api/contest/exam?subject=DATAPREV&topic=LGPD
// Gera um item de julgamento certo/errado estilo Cebraspe/FGV. Funciona para qualquer
// concurso/matéria informado em `subject` — não é específico do DATAPREV. Se houver
// material ingerido (via ingestBook.js) para essa matéria, o item é embasado nele (RAG).
contestRouter.get("/exam", async (req, res) => {
  const subject = req.query.subject || "DATAPREV";
  const topic = req.query.topic || "";

  try {
    const result = geminiEnabled ? await generateWithGemini(subject, topic) : mockExam(subject);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao gerar o simulado.", details: error.message });
  }
});

async function generateWithGemini(subject, topic) {
  const chunks = await retrieveContext(`${subject} ${topic}`, { subject });
  const context = formatContextForPrompt(chunks);

  const prompt = `Você é um examinador de banca de concurso público brasileiro (estilo Cebraspe ou FGV).
Matéria/concurso: ${subject}${topic ? ` — tópico: ${topic}` : ""}.

Material de referência para embasar o item (edital, resumo ou apostila do concurso):
---
${context}
---

Crie UM item de julgamento "certo ou errado" (uma afirmação objetiva, sem alternativas de múltipla
escolha), coerente com o material acima quando houver contexto disponível, ou com conhecimento geral
da área quando não houver material cadastrado para essa matéria. Responda SOMENTE em JSON neste formato:
{
  "subject": "${subject}",
  "prompt": "afirmação a ser julgada",
  "answer": "Certo ou Errado",
  "explanation": "justificativa objetiva em 1-2 frases"
}`;

  const model = getTextModel();
  const result = await model.generateContent(prompt);
  return extractJson(result.response.text());
}

function mockExam(subject) {
  const question = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
  return { subject, ...question };
}
