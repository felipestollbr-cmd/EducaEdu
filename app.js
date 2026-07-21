const student = {
  xp: 1240,
  coins: 320
};

const demoUsers = {
  student: { user: "sofia@educa7.ai", password: "aluno123", name: "Sofia", label: "Aluno • 7º ano" },
  parent: { user: "pais@educa7.ai", password: "pais123", name: "Responsável", label: "Pais • acompanhamento" },
  teacher: { user: "prof@educa7.ai", password: "prof123", name: "Professor", label: "Professor • turma 7º ano" },
  admin: { user: "admin@educa7.ai", password: "admin123", name: "Admin", label: "Administrador • sistema" }
};

const allowedViews = {
  student: ["home", "homework", "study", "quiz", "dashboard", "school", "week"],
  parent: ["parents", "dashboard", "school", "week"],
  teacher: ["teacher", "dashboard", "quiz", "school", "week"],
  admin: ["home", "homework", "study", "quiz", "dashboard", "parents", "teacher", "admin", "school", "week"]
};

const landingView = {
  student: "home",
  parent: "parents",
  teacher: "teacher",
  admin: "admin"
};

let currentSession = null;

const schoolData = {
  agenda: [
    { date: "2026-07-25", subject: "Matemática", title: "Prova de frações" },
    { date: "2026-07-28", subject: "Ciências", title: "Trabalho sobre Sistema Solar" },
    { date: "2026-07-30", subject: "Português", title: "Revisão de interpretação" }
  ],
  lessons: [
    { subject: "Matemática", topic: "Soma de frações com denominadores diferentes", homework: "Página 42, exercícios 1 a 5" },
    { subject: "Português", topic: "Identificação da ideia principal no texto", homework: "Leitura e resumo curto" },
    { subject: "Ciências", topic: "Movimentos da Terra", homework: "Mapa mental no caderno" }
  ],
  grades: [
    { subject: "Matemática", type: "Lista de exercícios", value: 7.0 },
    { subject: "Português", type: "Interpretação de texto", value: 8.5 },
    { subject: "Ciências", type: "Trabalho", value: 8.0 }
  ]
};

const weeklyStudy = [
  {
    day: "Segunda-feira",
    date: "22/07",
    subject: "Matemática",
    teacher: "Prof. Carla lançou: frações equivalentes, página 42, exercícios 1 a 5.",
    student: "Sofia enviou foto do dever. A IA corrigiu 7/10 e explicou denominadores diferentes.",
    parent: "Pais viram alerta amarelo: revisar com exemplos de pizza e dinheiro por 15 minutos."
  },
  {
    day: "Terça-feira",
    date: "23/07",
    subject: "Português",
    teacher: "Prof. Renata lançou interpretação de texto: identificar ideia principal e palavras-chave.",
    student: "Sofia fez quiz de 8 perguntas, acertou 7 e completou 5 flashcards.",
    parent: "Pais receberam mensagem positiva: boa evolução e leitura mais atenta."
  },
  {
    day: "Quarta-feira",
    date: "24/07",
    subject: "Ciências",
    teacher: "Prof. Marcos registrou aula sobre Sistema Solar e pediu mapa mental no caderno.",
    student: "Sofia enviou o mapa mental e fez mini game de associação dos planetas.",
    parent: "Pais visualizaram tarefa concluída e recomendação de revisar rotação e translação."
  },
  {
    day: "Quinta-feira",
    date: "25/07",
    subject: "História",
    teacher: "Prof. Aline lançou resumo da Idade Média e atividade de linha do tempo.",
    student: "Sofia respondeu parcialmente. A IA marcou 2 pontos incompletos e pediu refazer uma resposta.",
    parent: "Pais viram status parcial e sugestão: conversar sobre causa e consequência dos fatos."
  },
  {
    day: "Sexta-feira",
    date: "26/07",
    subject: "Inglês",
    teacher: "Prof. Daniel lançou Simple Present com 10 frases de treino.",
    student: "Sofia concluiu o quiz, acertou 8/10 e ganhou bônus de sequência semanal.",
    parent: "Pais receberam relatório semanal com progresso, XP e plano de revisão da próxima semana."
  }
];

const subjects = [
  ["Matemática", 68, "Frações"],
  ["Português", 82, "Interpretação"],
  ["Ciências", 74, "Sistema Solar"],
  ["História", 77, "Linha do tempo"],
  ["Geografia", 70, "Escalas"],
  ["Inglês", 65, "Verbos"]
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

function setView(name) {
  if (currentSession && !allowedViews[currentSession.role].includes(name)) {
    toast("Acesso restrito para este perfil.");
    return;
  }

  $$(".view").forEach((view) => view.classList.remove("active"));
  const target = $(`#view-${name}`);
  if (target) target.classList.add("active");

  $$(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === name);
  });
}

function setRole(role) {
  if (currentSession && currentSession.role !== "admin" && currentSession.role !== role) {
    toast("Troca de perfil restrita. Faça login com outro usuário.");
    return;
  }

  $$("[data-role]").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });

  if (role === "student") setView("home");
  if (role === "parent") setView("parents");
  if (role === "teacher") setView("teacher");
  if (role === "admin") setView("admin");
}

function applySession(session) {
  currentSession = session;
  localStorage.setItem("educa7_session", JSON.stringify(session));
  $("#loginScreen").classList.add("hidden");
  $("#appProduct").classList.remove("locked");
  $("#sessionName").textContent = session.name;
  $("#sessionRole").textContent = session.label;

  $$("[data-role]").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === session.role);
    button.disabled = session.role !== "admin" && button.dataset.role !== session.role;
  });

  setView(landingView[session.role]);
  updateSchoolPermissions();
  toast(`Login realizado: ${session.label}.`);
}

function logout() {
  currentSession = null;
  localStorage.removeItem("educa7_session");
  $("#appProduct").classList.add("locked");
  $("#loginScreen").classList.remove("hidden");
  $("#loginPassword").value = "";
  $("#loginError").textContent = "";
  $$("[data-role]").forEach((button) => {
    button.disabled = false;
  });
}

function handleLogin(event) {
  event.preventDefault();
  const role = $("#loginRole").value;
  const user = $("#loginUser").value.trim().toLowerCase();
  const password = $("#loginPassword").value;
  const demo = demoUsers[role];

  if (!demo || demo.user !== user || demo.password !== password) {
    $("#loginError").textContent = "Usuário, senha ou perfil inválido para este MVP.";
    return;
  }

  $("#loginError").textContent = "";
  applySession({ role, name: demo.name, label: demo.label, user: demo.user });
}

function fillDemo(role) {
  const demo = demoUsers[role];
  $("#loginRole").value = role;
  $("#loginUser").value = demo.user;
  $("#loginPassword").value = demo.password;
}

function updateStats() {
  $("#xp").textContent = student.xp;
  $("#coins").textContent = student.coins;
  const percentage = Math.min(92, Math.round((student.xp / 1500) * 100));
  $("#xpBar").style.width = `${percentage}%`;
}

function renderSubjects() {
  $("#subjectList").innerHTML = subjects.map(([name, mastery, difficulty]) => `
    <article class="subject-item">
      <div class="row">
        <div>
          <strong>${name}</strong>
          <p style="margin:3px 0 0">Dificuldade: ${difficulty}</p>
        </div>
        <b>${mastery}%</b>
      </div>
      <div class="bar"><span style="--w:${mastery}%"></span></div>
    </article>
  `).join("");
}

function analyzeHomework() {
  const box = $("#analysisBox");
  const steps = [
    "Lendo a foto do dever",
    "Detectando matéria: Matemática",
    "Comparando respostas",
    "Criando explicação simples",
    "Preparando resumo para os pais"
  ];

  box.innerHTML = `<div class="scan-steps">${steps.map((step) => `<div>${step}</div>`).join("")}</div>`;

  setTimeout(() => {
    student.xp += 35;
    student.coins += 12;
    updateStats();
    box.innerHTML = `
      <p class="kicker">Correção pronta</p>
      <h3>Matemática — Frações</h3>
      <p>O dever está parcialmente correto. Os erros apareceram na soma de frações com denominadores diferentes.</p>
      <div class="result-grid">
        <div><strong>7</strong><span>acertos</span></div>
        <div><strong>3</strong><span>erros</span></div>
        <div><strong>+35</strong><span>XP</span></div>
      </div>
      <p><b>Para Sofia:</b> primeiro encontre um denominador comum. Depois some apenas os numeradores.</p>
      <p><b>Para os pais:</b> revise com exemplos de pizza, dinheiro e divisão de objetos.</p>
    `;
    toast("Dever analisado. +35 XP e +12 moedas.");
  }, 1700);
}

function answerQuiz(button) {
  const correct = button.dataset.correct === "true";
  $$("#quizBox button").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.correct === "true") btn.classList.add("correct");
  });
  if (!correct) button.classList.add("wrong");

  const xp = correct ? 20 : 8;
  student.xp += xp;
  updateStats();

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.innerHTML = correct
    ? `<b>Muito bem.</b> Para somar frações diferentes, primeiro igualamos os denominadores. +${xp} XP.`
    : `<b>Boa tentativa.</b> O correto é encontrar um denominador comum antes de somar. +${xp} XP pelo esforço.`;
  $("#quizBox").appendChild(feedback);
}

function startFocus() {
  student.xp += 15;
  updateStats();
  $("#timer").textContent = "14";
  toast("Modo foco iniciado. Uma etapa de cada vez.");
}

function generateReport() {
  $("#reportBox").innerHTML = `
    <b>Relatório semanal:</b> Sofia manteve boa frequência e melhorou em Português.
    O maior ponto de atenção é Matemática, especialmente frações com denominadores diferentes.
    Plano sugerido: 15 minutos por dia, 5 exercícios parecidos e revisão antes da prova.
  `;
  toast("Relatório dos pais gerado.");
}

function createTeacherPlan() {
  $("#teacherBox").innerHTML = `
    <b>Atividade criada:</b> quiz adaptativo de frações com 3 níveis.
    A IA separou questões fáceis para revisão, médias para treino e desafios para alunos avançados.
    O professor pode enviar para a turma e acompanhar quem precisa de reforço.
  `;
  toast("Atividade da turma criada.");
}

function runAdminAudit() {
  $("#adminBox").innerHTML = `
    <b>Auditoria concluída:</b> nenhum alerta crítico.
    Recomendações: exigir aprovação dos pais para novos alunos, registrar origem dos materiais enviados
    e manter moderação ativa em todas as respostas da IA.
  `;
  toast("Auditoria de segurança concluída.");
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function renderSchool() {
  $("#agendaItems").innerHTML = schoolData.agenda.map((item) => `
    <article class="school-item">
      <b>${item.subject} — ${item.title}</b>
      <span class="meta">${formatDate(item.date)}</span>
    </article>
  `).join("");

  $("#lessonItems").innerHTML = schoolData.lessons.map((item) => `
    <article class="school-item">
      <b>${item.subject}</b>
      <span>${item.topic}</span>
      <span class="meta">Dever: ${item.homework}</span>
    </article>
  `).join("");

  $("#gradeItems").innerHTML = schoolData.grades.map((item) => `
    <article class="grade-item">
      <div>
        <b>${item.subject}</b>
        <span class="meta">${item.type}</span>
      </div>
      <div class="grade-badge">${Number(item.value).toFixed(1)}</div>
    </article>
  `).join("");
}

function renderWeek() {
  $("#weekTimeline").innerHTML = weeklyStudy.map((item) => `
    <article class="week-day">
      <header>
        <b>${item.day}</b>
        <span>${item.date} • ${item.subject}</span>
      </header>
      <div class="week-lanes">
        <div class="week-lane teacher">
          <strong>Professor</strong>
          <p>${item.teacher}</p>
        </div>
        <div class="week-lane student">
          <strong>Aluno</strong>
          <p>${item.student}</p>
        </div>
        <div class="week-lane parent">
          <strong>Pais</strong>
          <p>${item.parent}</p>
        </div>
      </div>
    </article>
  `).join("");
}

function setSchoolTab(tab) {
  $$("[data-school-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.schoolTab === tab);
  });
  $$(".school-panel").forEach((panel) => panel.classList.remove("active"));
  $(`#school-${tab}`).classList.add("active");
}

function updateSchoolPermissions() {
  const canEdit = currentSession && ["teacher", "admin"].includes(currentSession.role);
  $$(".teacher-only").forEach((element) => {
    element.classList.toggle("locked", !canEdit);
  });
}

function addAgendaItem() {
  schoolData.agenda.unshift({
    date: $("#agendaDate").value || new Date().toISOString().slice(0, 10),
    subject: $("#agendaSubject").value || "Matemática",
    title: $("#agendaTitle").value || "Nova atividade"
  });
  renderSchool();
  toast("Agenda escolar atualizada.");
}

function addLessonItem() {
  schoolData.lessons.unshift({
    subject: $("#lessonSubject").value || "Matemática",
    topic: $("#lessonTopic").value || "Conteúdo lecionado",
    homework: $("#lessonHomework").value || "Sem dever informado"
  });
  renderSchool();
  toast("Matéria lecionada registrada.");
}

function addGradeItem() {
  const value = Number($("#gradeValue").value || 0);
  schoolData.grades.unshift({
    subject: $("#gradeSubject").value || "Matemática",
    type: $("#gradeType").value || "Avaliação",
    value: Math.max(0, Math.min(10, value))
  });
  renderSchool();
  toast("Nota lançada no boletim.");
}

function bind() {
  $$("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $$("[data-role]").forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });

  $("#loginForm").addEventListener("submit", handleLogin);
  $("#logoutBtn").addEventListener("click", logout);
  $$("[data-demo-role]").forEach((button) => {
    button.addEventListener("click", () => fillDemo(button.dataset.demoRole));
  });

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  $("#homeworkFile").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    $("#fileLabel").textContent = file ? file.name : "Enviar foto ou PDF";
  });

  $$(".subject-pill").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".subject-pill").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  $("#analyzeBtn").addEventListener("click", analyzeHomework);
  $("#focusBtn").addEventListener("click", startFocus);
  $("#parentReport").addEventListener("click", generateReport);
  $("#teacherPlan").addEventListener("click", createTeacherPlan);
  $("#adminAudit").addEventListener("click", runAdminAudit);
  $("#addAgendaItem").addEventListener("click", addAgendaItem);
  $("#addLessonItem").addEventListener("click", addLessonItem);
  $("#addGradeItem").addEventListener("click", addGradeItem);
  $$("[data-school-tab]").forEach((button) => {
    button.addEventListener("click", () => setSchoolTab(button.dataset.schoolTab));
  });

  $$("#quizBox button").forEach((button) => {
    button.addEventListener("click", () => answerQuiz(button));
  });
}

renderSubjects();
renderSchool();
renderWeek();
updateStats();
bind();

try {
  const savedSession = JSON.parse(localStorage.getItem("educa7_session"));
  if (savedSession?.role) applySession(savedSession);
} catch {
  localStorage.removeItem("educa7_session");
}
