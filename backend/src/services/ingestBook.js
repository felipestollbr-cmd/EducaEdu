// Ingesta um PDF do material didático (ex: livro do Sistema Positivo) para a base de RAG.
// Uso: node src/services/ingestBook.js <caminho.pdf> "<Nome do livro>" "<Matéria>"
// Ex:  node src/services/ingestBook.js ./books/matematica-7ano.pdf "Sistema Positivo - Matemática 7º ano" Matemática

import "dotenv/config";
import fs from "node:fs";
import { geminiEnabled } from "./gemini.js";
import { ingestPdfBuffer } from "./ingest.js";

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
  console.log(`Livro "${bookName}": extraindo texto e gerando embeddings...`);

  const { chunkCount } = await ingestPdfBuffer(buffer, bookName, subject, (done, total) => {
    if (done % 10 === 0 || done === total) console.log(`  ${done}/${total} trechos processados`);
  });

  console.log(`Ingestão concluída: ${chunkCount} trechos.`);
}

main().catch((error) => {
  console.error("Falha na ingestão:", error.message);
  process.exit(1);
});
