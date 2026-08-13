// Ingesta um PDF do material didático (ex: livro do Sistema Positivo) para a base de RAG.
// Uso: node src/services/ingestBook.js <caminho.pdf> "<Nome do livro>" "<Matéria>"
// Ex:  node src/services/ingestBook.js ./books/matematica-7ano.pdf "Sistema Positivo - Matemática 7º ano" Matemática

import "dotenv/config";
import fs from "node:fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { db } from "../db.js";
import { embedText, geminiEnabled } from "./gemini.js";

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

async function main() {
  const [, , filePath, bookName, subject] = process.argv;

  if (!filePath || !bookName) {
    console.error('Uso: node src/services/ingestBook.js <caminho.pdf> "<Nome do livro>" "<Matéria>"');
    process.exit(1);
  }

  if (!geminiEnabled) {
    console.error("GEMINI_API_KEY não configurada. Defina a variável no arquivo .env antes de ingerir livros.");
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  const chunks = chunkText(parsed.text);

  console.log(`Livro "${bookName}": ${chunks.length} trechos extraídos. Gerando embeddings...`);

  const insert = db.prepare(
    "INSERT INTO book_chunks (book, subject, source_page, content, embedding) VALUES (?, ?, ?, ?, ?)"
  );

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    insert.run(bookName, subject || null, null, chunks[i], JSON.stringify(embedding));
    if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
      console.log(`  ${i + 1}/${chunks.length} trechos processados`);
    }
  }

  console.log("Ingestão concluída.");
}

main().catch((error) => {
  console.error("Falha na ingestão:", error.message);
  process.exit(1);
});
