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
    mode TEXT NOT NULL DEFAULT 'correct',
    correct_count INTEGER,
    wrong_count INTEGER,
    explanation_student TEXT,
    explanation_parent TEXT,
    guiding_question TEXT,
    hint TEXT,
    matched_agenda_id INTEGER,
    source TEXT NOT NULL DEFAULT 'mock',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS content_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'review',
    owner TEXT,
    format TEXT,
    lessons INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'montando',
    description TEXT,
    raw_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS student_progress (
    student TEXT PRIMARY KEY,
    xp INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date TEXT
  );

  CREATE TABLE IF NOT EXISTS book_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT NOT NULL,
    subject TEXT,
    source_page INTEGER,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'escola',
    city TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    track TEXT,
    school_id INTEGER REFERENCES schools(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (columns.some((col) => col.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

addColumnIfMissing("homework_submissions", "mode", "TEXT NOT NULL DEFAULT 'correct'");
addColumnIfMissing("homework_submissions", "guiding_question", "TEXT");
addColumnIfMissing("homework_submissions", "hint", "TEXT");

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
  "student_progress",
  [["Sofia", 1240, 320, 6, null]],
  "INSERT INTO student_progress (student, xp, coins, streak, last_activity_date) VALUES (?, ?, ?, ?, ?)"
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

seedIfEmpty(
  "content_packages",
  [
    [
      "Frações - 7º ano",
      "school",
      "Escola",
      "Slides + exercícios",
      4,
      "pronto",
      "Conteúdo visual para reforçar numerador, denominador, equivalência e soma.",
      JSON.stringify({ nome: "Frações - 7º ano", tipo: "school", dono: "Escola", formato: "Slides + exercícios", modulos: [{ nome: "Frações", licoes: ["Numerador e denominador", "Equivalência", "Soma"] }] })
    ],
    [
      "DATAPREV - Previdenciário",
      "contest",
      "Felipe",
      "PDF + questões",
      8,
      "montando",
      "Pacote de estudo para RGPS, benefícios, carência e qualidade de segurado.",
      JSON.stringify({ nome: "DATAPREV - Previdenciário", tipo: "contest", dono: "Felipe", formato: "PDF + questões", modulos: [{ nome: "RGPS", licoes: ["Qualidade de segurado", "Carência", "Benefícios"] }] })
    ],
    [
      "Português - Interpretação",
      "review",
      "Família",
      "Resumo + flashcards",
      5,
      "pronto",
      "Trilha reaproveitável para Sofia e para concurso, com níveis de dificuldade.",
      JSON.stringify({ nome: "Português - Interpretação", tipo: "review", dono: "Família", formato: "Resumo + flashcards", modulos: [{ nome: "Interpretação", licoes: ["Ideia principal", "Palavras-chave", "Inferência"] }] })
    ]
  ],
  "INSERT INTO content_packages (title, type, owner, format, lessons, status, description, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
