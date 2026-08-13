import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
export const geminiEnabled = Boolean(apiKey);

const client = geminiEnabled ? new GoogleGenerativeAI(apiKey) : null;

export function getVisionModel() {
  return client.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export function getTextModel() {
  return client.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export async function embedText(text) {
  const model = client.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Extrai o primeiro bloco JSON de uma resposta de texto do modelo. */
export function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Resposta do modelo não contém JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}
