import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { db } from "../db.js";
import { embedText } from "./gemini.js";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;

function chunkText(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// Quebra um PDF em trechos, gera embeddings e salva em book_chunks. Usado tanto pelo
// script de linha de comando (ingestBook.js) quanto pelo upload via web (POST /api/library/materials).
export async function ingestPdfBuffer(buffer, bookName, subject, onProgress) {
  const parsed = await pdfParse(buffer);
  const chunks = chunkText(parsed.text);

  const insert = db.prepare(
    "INSERT INTO book_chunks (book, subject, source_page, content, embedding) VALUES (?, ?, ?, ?, ?)"
  );

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    insert.run(bookName, subject || null, null, chunks[i], JSON.stringify(embedding));
    onProgress?.(i + 1, chunks.length);
  }

  return { chunkCount: chunks.length };
}
