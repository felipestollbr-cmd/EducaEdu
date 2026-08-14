import { Router } from "express";
import { db } from "../db.js";

export const progressRouter = Router();

progressRouter.get("/", (req, res) => {
  const student = req.query.student || "Sofia";
  res.json(getOrCreateProgress(student));
});

progressRouter.post("/award", (req, res) => {
  const { student = "Sofia", xp = 0, coins = 0 } = req.body;
  const current = getOrCreateProgress(student);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = current.streak;
  if (current.last_activity_date === today) {
    // já estudou hoje, mantém a sequência
  } else if (current.last_activity_date === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  const updated = {
    xp: current.xp + Number(xp || 0),
    coins: current.coins + Number(coins || 0),
    streak,
    last_activity_date: today
  };

  db.prepare(
    "UPDATE student_progress SET xp = ?, coins = ?, streak = ?, last_activity_date = ? WHERE student = ?"
  ).run(updated.xp, updated.coins, updated.streak, updated.last_activity_date, student);

  res.json({ student, ...updated });
});

function getOrCreateProgress(student) {
  const existing = db.prepare("SELECT * FROM student_progress WHERE student = ?").get(student);
  if (existing) return existing;

  db.prepare(
    "INSERT INTO student_progress (student, xp, coins, streak, last_activity_date) VALUES (?, 0, 0, 0, NULL)"
  ).run(student);
  return db.prepare("SELECT * FROM student_progress WHERE student = ?").get(student);
}
