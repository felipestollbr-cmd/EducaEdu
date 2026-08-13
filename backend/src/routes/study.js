import { Router } from "express";
import { db } from "../db.js";
import { getTextModel, geminiEnabled, extractJson } from "../services/gemini.js";
import { retrieveContext, formatContextForPrompt } from "../services/rag.js";

export const studyRouter = Router();

// Gera o material de estudo do dia: prioriza matérias com prova/entrega mais próxima na agenda,
// busca o conteúdo correspondente no material didático (RAG) e monta flashcards + quiz curto.
studyRouter.get("/daily", async (_req, res) => {
  try {
    const upcoming = nextAgendaItems();
    if (upcoming.length === 0) {
      return res.json({ items: [], message: "Nenhum item futuro na agenda escolar." });
    }

    const items = [];
    for (const agendaItem of upcoming) {
      items.push(await buildStudyBlock(agendaItem));
    }

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao gerar o estudo do dia.", details: error.message });
  }
});

function nextAgendaItems(limit = 3) {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .prepare("SELECT * FROM agenda WHERE date >= ? ORDER BY date ASC LIMIT ?")
    .all(today, limit);
}

async function buildStudyBlock(agendaItem) {
  const daysUntil = Math.ceil(
    (new Date(agendaItem.date) - new Date(new Date().toISOString().slice(0, 10))) / (1000 * 60 * 60 * 24)
  );

  if (!geminiEnabled) {
    return mockStudyBlock(agendaItem, daysUntil);
  }

  const chunks = await retrieveContext(`${agendaItem.subject} ${agendaItem.title}`, {
    subject: agendaItem.subject
  });
  const context = formatContextForPrompt(chunks);

  const prompt = `Você é um tutor particular de uma criança do ensino fundamental.
Item da agenda escolar: "${agendaItem.title}" (matéria: ${agendaItem.subject}, em ${daysUntil} dia(s)).

Material didático de referência para embasar o conteúdo:
---
${context}
---

Gere um bloco de estudo curto (15-20 minutos) para hoje, focado exatamente nesse item da agenda.
Responda SOMENTE em JSON neste formato:
{
  "summary": "resumo de 3-4 frases do que precisa ser revisado",
  "flashcards": [{"front": "pergunta ou termo", "back": "resposta ou definição"}, ... 4 itens],
  "quiz": [{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A", "explanation": "..."}, ... 3 itens]
}`;

  const model = getTextModel();
  const result = await model.generateContent(prompt);
  const generated = extractJson(result.response.text());

  return {
    agenda: agendaItem,
    daysUntil,
    ...generated
  };
}

function mockStudyBlock(agendaItem, daysUntil) {
  return {
    agenda: agendaItem,
    daysUntil,
    summary: `(modo demonstração) Revisar ${agendaItem.subject}: ${agendaItem.title}.`,
    flashcards: [
      { front: "Numerador", back: "Número de cima na fração, indica quantas partes foram tomadas." },
      { front: "Denominador", back: "Número de baixo na fração, indica em quantas partes o todo foi dividido." }
    ],
    quiz: [
      {
        question: "Para somar 1/2 + 1/3, o primeiro passo é:",
        options: ["A) Somar numeradores direto", "B) Igualar os denominadores", "C) Multiplicar tudo por 2", "D) Ignorar os denominadores"],
        correct: "B",
        explanation: "É preciso um denominador comum antes de somar os numeradores."
      }
    ]
  };
}
