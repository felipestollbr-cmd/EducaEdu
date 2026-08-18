import { Router } from "express";
import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../services/password.js";

export const authRouter = Router();

const ROLES = ["student", "parent", "teacher", "admin"];
const TRACKS = ["escola", "concurso"];

authRouter.post("/register", (req, res) => {
  const { name, email, password, role, track, schoolId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Nome, e-mail, senha e perfil são obrigatórios." });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: "Perfil inválido." });
  }
  if (role === "student" && track && !TRACKS.includes(track)) {
    return res.status(400).json({ error: "Trilha inválida." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
  }

  const passwordHash = hashPassword(password);
  const result = db
    .prepare(`
      INSERT INTO users (name, email, password_hash, role, track, school_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      String(name).trim(),
      normalizedEmail,
      passwordHash,
      role,
      role === "student" ? track || null : null,
      schoolId || null
    );

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(toPublicUser(user));
});

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email).trim().toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  }

  res.json(toPublicUser(user));
});

function toPublicUser(user) {
  let school = null;
  if (user.school_id) {
    school = db.prepare("SELECT id, name, type FROM schools WHERE id = ?").get(user.school_id);
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    track: user.track,
    school
  };
}
