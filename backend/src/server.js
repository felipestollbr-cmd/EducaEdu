import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { homeworkRouter } from "./routes/homework.js";
import { schoolRouter } from "./routes/school.js";
import { studyRouter } from "./routes/study.js";
import { progressRouter } from "./routes/progress.js";
import { geminiEnabled } from "./services/gemini.js";
import "./db.js"; // garante que o schema e o seed rodem na subida

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.join(__dirname, "..", "..");

const app = express();
app.use(express.json());
app.use(express.static(frontendDir));

app.use("/api/homework", homeworkRouter);
app.use("/api/school", schoolRouter);
app.use("/api/study", studyRouter);
app.use("/api/progress", progressRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", geminiEnabled });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`EducaEdu rodando em http://localhost:${port}`);
  console.log(`Gemini: ${geminiEnabled ? "ativado" : "desativado (modo demonstração — defina GEMINI_API_KEY no .env)"}`);
});
