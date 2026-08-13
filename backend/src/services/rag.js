import { db } from "../db.js";
import { embedText, cosineSimilarity, geminiEnabled } from "./gemini.js";

/**
 * Busca os trechos do material didático mais relevantes para uma consulta
 * (ex: matéria + tópico do dever de casa), para embasar a explicação da IA
 * no conteúdo real que a criança está estudando.
 */
export async function retrieveContext(query, { subject, topK = 4 } = {}) {
  if (!geminiEnabled) return [];

  const rows = subject
    ? db.prepare("SELECT id, book, subject, source_page, content, embedding FROM book_chunks WHERE subject = ?").all(subject)
    : db.prepare("SELECT id, book, subject, source_page, content, embedding FROM book_chunks").all();

  if (rows.length === 0) return [];

  const queryEmbedding = await embedText(query);
  const scored = rows.map((row) => ({
    ...row,
    score: cosineSimilarity(queryEmbedding, JSON.parse(row.embedding))
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}

export function formatContextForPrompt(chunks) {
  if (chunks.length === 0) return "Nenhum material didático cadastrado ainda para esta matéria.";
  return chunks
    .map((chunk, index) => `[Trecho ${index + 1} — ${chunk.book}, pág. ${chunk.source_page ?? "?"}]\n${chunk.content}`)
    .join("\n\n");
}
