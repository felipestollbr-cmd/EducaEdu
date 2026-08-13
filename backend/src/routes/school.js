import { Router } from "express";
import { db } from "../db.js";

export const schoolRouter = Router();

schoolRouter.get("/agenda", (_req, res) => {
  res.json(db.prepare("SELECT * FROM agenda ORDER BY date ASC").all());
});

schoolRouter.post("/agenda", (req, res) => {
  const { date, subject, title } = req.body;
  if (!date || !subject || !title) {
    return res.status(400).json({ error: "date, subject e title são obrigatórios." });
  }
  const result = db
    .prepare("INSERT INTO agenda (date, subject, title) VALUES (?, ?, ?)")
    .run(date, subject, title);
  res.status(201).json({ id: result.lastInsertRowid, date, subject, title });
});

schoolRouter.get("/lessons", (_req, res) => {
  res.json(db.prepare("SELECT * FROM lessons ORDER BY created_at DESC").all());
});

schoolRouter.post("/lessons", (req, res) => {
  const { subject, topic, homework } = req.body;
  if (!subject || !topic || !homework) {
    return res.status(400).json({ error: "subject, topic e homework são obrigatórios." });
  }
  const result = db
    .prepare("INSERT INTO lessons (subject, topic, homework) VALUES (?, ?, ?)")
    .run(subject, topic, homework);
  res.status(201).json({ id: result.lastInsertRowid, subject, topic, homework });
});

schoolRouter.get("/grades", (_req, res) => {
  res.json(db.prepare("SELECT * FROM grades ORDER BY id DESC").all());
});

schoolRouter.post("/grades", (req, res) => {
  const { subject, type, value } = req.body;
  const numericValue = Math.max(0, Math.min(10, Number(value) || 0));
  if (!subject || !type) {
    return res.status(400).json({ error: "subject e type são obrigatórios." });
  }
  const result = db
    .prepare("INSERT INTO grades (subject, type, value) VALUES (?, ?, ?)")
    .run(subject, type, numericValue);
  res.status(201).json({ id: result.lastInsertRowid, subject, type, value: numericValue });
});
