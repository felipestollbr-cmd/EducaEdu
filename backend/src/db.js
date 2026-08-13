import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "educaedu.sqlite");

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    homework TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS homework_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student TEXT NOT NULL,
    subject TEXT,
    image_path TEXT,
    transcribed_text TEXT,
    correct_count INTEGER,
    wrong_count INTEGER,
    explanation_student TEXT,
    explanation_parent TEXT,
    matched_agenda_id INTEGER,
    source TEXT NOT NULL DEFAULT 'mock',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS book_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT NOT NULL,
    subject TEXT,
    source_page INTEGER,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL
  );
`);

function seedIfEmpty(table, rows, insertSql) {
  const { count } = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  if (count > 0) return;
  const stmt = db.prepare(insertSql);
  for (const row of rows) stmt.run(...row);
}

seedIfEmpty(
  "agenda",
  [
    ["2026-07-25", "Matemática", "Prova de frações"],
    ["2026-07-28", "Ciências", "Trabalho sobre Sistema Solar"],
    ["2026-07-30", "Português", "Revisão de interpretação"]
  ],
  "INSERT INTO agenda (date, subject, title) VALUES (?, ?, ?)"
);

seedIfEmpty(
  "lessons",
  [
    ["Matemática", "Soma de frações com denominadores diferentes", "Página 42, exercícios 1 a 5"],
    ["Português", "Identificação da ideia principal no texto", "Leitura e resumo curto"],
    ["Ciências", "Movimentos da Terra", "Mapa mental no caderno"]
  ],
  "INSERT INTO lessons (subject, topic, homework) VALUES (?, ?, ?)"
);

seedIfEmpty(
  "grades",
  [
    ["Matemática", "Lista de exercícios", 7.0],
    ["Português", "Interpretação de texto", 8.5],
    ["Ciências", "Trabalho", 8.0]
  ],
  "INSERT INTO grades (subject, type, value) VALUES (?, ?, ?)"
);
