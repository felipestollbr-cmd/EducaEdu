import { Router } from "express";
import { db } from "../db.js";

export const schoolsRouter = Router();

schoolsRouter.get("/", (_req, res) => {
  res.json(db.prepare("SELECT * FROM schools ORDER BY name ASC").all());
});

schoolsRouter.post("/", (req, res) => {
  const { name, type, city } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Nome da escola/cursinho é obrigatório." });
  }
  const normalizedType = type === "cursinho" ? "cursinho" : "escola";
  const result = db
    .prepare("INSERT INTO schools (name, type, city) VALUES (?, ?, ?)")
    .run(String(name).trim(), normalizedType, city ? String(city).trim() : null);

  res.status(201).json(db.prepare("SELECT * FROM schools WHERE id = ?").get(result.lastInsertRowid));
});
