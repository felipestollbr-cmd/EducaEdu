import { Router } from "express";
import { db } from "../db.js";

export const libraryRouter = Router();

libraryRouter.get("/packages", (req, res) => {
  const rows = db.prepare("SELECT * FROM content_packages ORDER BY id DESC").all();
  res.json(rows.map(toClient));
});

libraryRouter.get("/packages/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM content_packages WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Pacote não encontrado." });
  res.json(toClient(row));
});

libraryRouter.post("/packages", (req, res) => {
  const normalized = normalizePackage(req.body);
  if (!normalized) {
    return res.status(400).json({ error: "Pacote sem nome ou módulos. Use o modelo sugerido." });
  }

  const result = db
    .prepare(`
      INSERT INTO content_packages (title, type, owner, format, lessons, status, description, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      normalized.title,
      normalized.type,
      normalized.owner,
      normalized.format,
      normalized.lessons,
      normalized.status,
      normalized.description,
      JSON.stringify(req.body)
    );

  const row = db.prepare("SELECT * FROM content_packages WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(toClient(row));
});

function toClient(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    owner: row.owner,
    format: row.format,
    lessons: row.lessons,
    status: row.status,
    description: row.description
  };
}

function normalizePackage(packageData) {
  const title = packageData.nome || packageData.name || packageData.titulo;
  const modules = Array.isArray(packageData.modulos) ? packageData.modulos : [];
  if (!title || modules.length === 0) return null;

  const questionCount = modules.reduce(
    (total, module) => total + (Array.isArray(module.questoes) ? module.questoes.length : 0),
    0
  );
  const lessonCount = modules.reduce(
    (total, module) => total + (Array.isArray(module.licoes) ? module.licoes.length : 1),
    0
  );

  return {
    type: normalizePackageType(packageData.tipo || packageData.type),
    title,
    owner: packageData.dono || packageData.owner || "Importado",
    format: packageData.formato || packageData.format || "JSON",
    lessons: Math.max(lessonCount, modules.length),
    status: questionCount > 0 ? "pronto" : "montando",
    description:
      packageData.descricao ||
      packageData.description ||
      `${modules.length} módulos e ${questionCount} questões importadas.`
  };
}

function normalizePackageType(type) {
  const value = String(type || "").toLowerCase();
  if (["concurso", "contest", "dataprev"].includes(value)) return "contest";
  if (["escolar", "school", "filhos"].includes(value)) return "school";
  return "review";
}
