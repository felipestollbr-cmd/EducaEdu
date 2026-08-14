const STUDENT_NAME = "Sofia";

const student = {
  xp: 1240,
  coins: 320,
  streak: 6
};

const demoUsers = {
  student: { user: "sofia@educa7.ai", password: "aluno123", name: "Sofia", label: "Aluno • 7º ano" },
  parent: { user: "pais@educa7.ai", password: "pais123", name: "Responsável", label: "Pais • acompanhamento" },
  teacher: { user: "prof@educa7.ai", password: "prof123", name: "Professor", label: "Professor • turma 7º ano" },
  admin: { user: "admin@educa7.ai", password: "admin123", name: "Admin", label: "Administrador • sistema" }
};

const allowedViews = {
  student: ["home", "homework", "study", "quiz", "dashboard", "school", "week", "calendar", "library", "contest"],
  parent: ["parents", "dashboard", "school", "week", "calendar"],
  teacher: ["teacher", "dashboard", "quiz", "school", "week", "calendar", "library"],
  admin: ["home", "homework", "study", "quiz", "dashboard", "parents", "teacher", "admin", "school", "week", "calendar", "library", "contest"]
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

const studyCalendar = [
  { id: 1, day: "Hoje", date: "11/08", type: "school", title: "Matemática da Sofia", detail: "Frações com denominadores diferentes", time: "15 min", done: false },
  { id: 2, day: "Hoje", date: "11/08", type: "contest", title: "DATAPREV", detail: "Regime Geral de Previdência Social", time: "45 min", done: false },
  { id: 3, day: "Amanhã", date: "12/08", type: "review", title: "Revisão espaçada", detail: "Português: interpretação e crase", time: "25 min", done: false },
  { id: 4, day: "Quinta", date: "13/08", type: "school", title: "Ciências da Sofia", detail: "Sistema Solar e mapa mental", time: "20 min", done: true },
  { id: 5, day: "Sexta", date: "14/08", type: "contest", title: "Simulado curto", detail: "10 itens certo/errado com correção", time: "30 min", done: false }
];

const subjects = [
  ["Matemática", 68, "Frações"],
  ["Português", 82, "Interpretação"],
  ["Ciências", 74, "Sistema Solar"],
  ["História", 77, "Linha do tempo"],
  ["Geografia", 70, "Escalas"],
  ["Inglês", 65, "Verbos"]
];

const contestPlan = [
  { day: "Segunda", focus: "INSS + Regime Geral", time: "45 min", task: "Ler resumo e responder 12 questões." },
  { day: "Terça", focus: "Raciocínio Lógico", time: "35 min", task: "Treinar proposições e equivalências." },
  { day: "Quarta", focus: "Português", time: "40 min", task: "Interpretação e crase em questões Cebraspe." },
  { day: "Quinta", focus: "TI e Dados", time: "50 min", task: "Revisar SQL, modelagem e segurança." },
  { day: "Sexta", focus: "Simulado curto", time: "30 min", task: "10 questões com correção imediata." }
];

const contestTopics = [
  ["Previdenciário", 58, "maior prioridade"],
  ["Português", 74, "manter ritmo"],
  ["Raciocínio Lógico", 61, "treino diário"],
  ["TI / Dados", 69, "revisar pontos fracos"]
];

const contentLibrary = [
  {
    id: 1,
    type: "school",
    title: "Frações - 7º ano",
    owner: "Escola",
    format: "Slides + exercícios",
    lessons: 4,
    status: "pronto",
    description: "Conteúdo visual para reforçar numerador, denominador, equivalência e soma."
  },
  {
    id: 2,
    type: "contest",
    title: "DATAPREV - Previdenciário",
    owner: "Felipe",
    format: "PDF + questões",
    lessons: 8,
    status: "montando",
    description: "Pacote de estudo para RGPS, benefícios, carência e qualidade de segurado."
  },
  {
    id: 3,
    type: "review",
    title: "Português - Interpretação",
    owner: "Família",
    format: "Resumo + flashcards",
    lessons: 5,
    status: "pronto",
    description: "Trilha reaproveitável para Sofia e para concurso, com níveis de dificuldade."
  }
];

const samplePackage = {
  nome: "DATAPREV - Segurança Cibernética",
  tipo: "concurso",
  dono: "Felipe",
  formato: "JSON + slides",
  descricao: "Trilha baseada no edital, com módulos, revisões e questões para simulado.",
  modulos: [
    {
      nome: "LGPD",
      licoes: ["Fundamentos", "Bases legais", "Direitos do titular"],
      questoes: [
        {
          enunciado: "A LGPD se aplica somente a empresas públicas.",
          gabarito: "Errado"
        }
      ]
    },
    {
      nome: "Segurança da Informação",
      licoes: ["Confidencialidade", "Integridade", "Disponibilidade"],
      questoes: []
    }
  ]
};

const contestQuestions = [
  {
    prompt: "No RGPS, qualidade de segurado e carência são conceitos equivalentes.",
    answer: "Errado",
    explanation: "Qualidade de segurado indica vínculo/proteção; carência é o número mínimo de contribuições para certos benefícios."
  },
  {
    prompt: "Em bancos relacionais, uma chave primária identifica unicamente cada registro de uma tabela.",
    answer: "Certo",
    explanation: "A chave primária evita duplicidade na identificação e serve como referência para relacionamentos."
  },
  {
    prompt: "No modelo Cebraspe, uma resposta errada pode anular uma resposta certa, quando previsto no edital.",
    answer: "Certo",
    explanation: "Esse formato exige estratégia: responder com segurança e evitar chutes quando a penalização estiver ativa."
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let selectedHomeworkFile = null;
let selectedSubject = "";
let backendAvailable = false;
let dailyStudyCache = [];
const dailyStudyDone = new Set();

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Falha na requisição: ${response.status}`);
  }
  return response.json();
}

async function loadProgress() {
  try {
    const progress = await api(`/progress?student=${encodeURIComponent(STUDENT_NAME)}`);
    student.xp = progress.xp;
    student.coins = progress.coins;
    student.streak = progress.streak;
    updateStats();
  } catch {
    // mantém os valores padrão em memória se o backend não responder
  }
}

function awardProgress(xp = 0, coins = 0) {
  student.xp += xp;
  student.coins += coins;
  updateStats();

  api("/progress/award", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student: STUDENT_NAME, xp, coins })
  })
    .then((progress) => {
      // sincroniza com o valor oficial do servidor (cobre streak e corrige qualquer desvio)
      student.xp = progress.xp;
      student.coins = progress.coins;
      student.streak = progress.streak;
      updateStats();
    })
    .catch(() => {
      // sem backend: os valores otimistas já aplicados localmente permanecem
    });
}

async function loadSchoolDataFromBackend() {
  try {
    const [agenda, lessons, grades] = await Promise.all([
      api("/school/agenda"),
      api("/school/lessons"),
      api("/school/grades")
    ]);
    schoolData.agenda = agenda;
    schoolData.lessons = lessons;
    schoolData.grades = grades;
    backendAvailable = true;
  } catch {
    backendAvailable = false;
  }
  renderSchool();
}

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

  $$(".app-nav button").forEach((button) => {
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

function renderContest() {
  $("#contestPlan").innerHTML = contestPlan.map((item) => `
    <article class="contest-plan-item">
      <div>
        <strong>${item.day}</strong>
        <span>${item.focus}</span>
      </div>
      <b>${item.time}</b>
      <p>${item.task}</p>
    </article>
  `).join("");

  $("#contestTopics").innerHTML = contestTopics.map(([name, mastery, note]) => `
    <article class="contest-topic">
      <div class="row">
        <div>
          <strong>${name}</strong>
          <p>${note}</p>
        </div>
        <b>${mastery}%</b>
      </div>
      <div class="bar"><span style="--w:${mastery}%"></span></div>
    </article>
  `).join("");
}

function renderLibrary(filter = "all") {
  const items = filter === "all"
    ? contentLibrary
    : contentLibrary.filter((item) => item.type === filter);

  $("#libraryItems").innerHTML = items.map((item) => `
    <article class="library-item">
      <div class="library-type">${libraryTypeLabel(item.type)}</div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.description}</p>
        <small>${item.format} • ${item.lessons} lições • ${item.owner}</small>
      </div>
      <button data-library-id="${item.id}" type="button">${item.status === "pronto" ? "Virar trilha" : "Completar"}</button>
    </article>
  `).join("");

  $("#libraryCount").textContent = `${items.length} pacote${items.length === 1 ? "" : "s"}`;
}

function libraryTypeLabel(type) {
  const labels = {
    school: "Escolar",
    contest: "Concurso",
    review: "Revisão"
  };
  return labels[type] || "Conteúdo";
}

function activateLibraryItem(id) {
  const item = contentLibrary.find((entry) => entry.id === Number(id));
  if (!item) return;

  studyCalendar.unshift({
    id: Date.now(),
    day: "Novo",
    date: "15/08",
    type: item.type === "contest" ? "contest" : "review",
    title: item.title,
    detail: `Trilha criada a partir da biblioteca: ${item.format}.`,
    time: item.type === "contest" ? "40 min" : "20 min",
    done: false
  });

  renderCalendar();
  toast("Conteúdo transformado em bloco no calendário.");
}

function importDemoPackage() {
  $("#libraryJsonInput").value = JSON.stringify(samplePackage, null, 2);
  toast("Exemplo de pacote JSON carregado.");
}

function importLibraryPackage() {
  const raw = $("#libraryJsonInput").value.trim();
  if (!raw) {
    toast("Cole um pacote JSON antes de importar.");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    toast("JSON inválido. Revise vírgulas, aspas e chaves.");
    return;
  }

  const item = normalizePackage(parsed);
  if (!item) {
    toast("Pacote sem nome ou módulos. Use o modelo sugerido.");
    return;
  }

  contentLibrary.unshift(item);
  renderLibrary($("#libraryFilter").value);
  $("#libraryJsonInput").value = "";
  toast("Pacote importado para a Biblioteca.");
}

function normalizePackage(packageData) {
  const title = packageData.nome || packageData.name || packageData.titulo;
  const modules = Array.isArray(packageData.modulos) ? packageData.modulos : [];
  if (!title || modules.length === 0) return null;

  const questionCount = modules.reduce((total, module) => {
    return total + (Array.isArray(module.questoes) ? module.questoes.length : 0);
  }, 0);
  const lessonCount = modules.reduce((total, module) => {
    return total + (Array.isArray(module.licoes) ? module.licoes.length : 1);
  }, 0);

  return {
    id: Date.now(),
    type: normalizePackageType(packageData.tipo || packageData.type),
    title,
    owner: packageData.dono || packageData.owner || "Importado",
    format: packageData.formato || packageData.format || "JSON",
    lessons: Math.max(lessonCount, modules.length),
    status: questionCount > 0 ? "pronto" : "montando",
    description: packageData.descricao || packageData.description || `${modules.length} módulos e ${questionCount} questões importadas.`
  };
}

function normalizePackageType(type) {
  const value = String(type || "").toLowerCase();
  if (["concurso", "contest", "dataprev"].includes(value)) return "contest";
  if (["escolar", "school", "filhos"].includes(value)) return "school";
  return "review";
}

function generateContestExam() {
  const question = contestQuestions[Math.floor(Math.random() * contestQuestions.length)];
  $("#contestExam").innerHTML = `
    <p class="kicker">Simulado Gemini demonstrativo</p>
    <h3>Julgue o item: certo ou errado</h3>
    <p>${question.prompt}</p>
    <div class="contest-answer">
      <strong>Gabarito: ${question.answer}</strong>
      <span>${question.explanation}</span>
    </div>
  `;
  awardProgress(25, 8);
  toast("Simulado gerado. +25 XP e +8 moedas.");
}

async function analyzeHomework() {
  const box = $("#analysisBox");
  const steps = [
    "Lendo a foto do dever",
    "Buscando o assunto no material didático",
    "Comparando respostas",
    "Criando explicação simples",
    "Preparando resumo para os pais"
  ];
  box.innerHTML = `<div class="scan-steps">${steps.map((step) => `<div>${step}</div>`).join("")}</div>`;

  let analysis;
  try {
    if (!selectedHomeworkFile) throw new Error("no-file");
    const formData = new FormData();
    formData.append("photo", selectedHomeworkFile);
    formData.append("student", STUDENT_NAME);
    if (selectedSubject) formData.append("subject", selectedSubject);
    analysis = await api("/homework/analyze", { method: "POST", body: formData });
  } catch (error) {
    // Sem foto selecionada ou backend indisponível: mantém a demonstração funcionando.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    analysis = {
      subject: selectedSubject || "Matemática",
      topic: "Frações",
      correct_count: 7,
      wrong_count: 3,
      explanation_student: "Primeiro encontre um denominador comum. Depois some apenas os numeradores.",
      explanation_parent: "Revise com exemplos de pizza, dinheiro e divisão de objetos."
    };
  }

  awardProgress(35, 12);

  box.innerHTML = `
    <p class="kicker">Correção pronta</p>
    <h3>${analysis.subject || "Matéria"} — ${analysis.topic || "Revisão"}</h3>
    <div class="result-grid">
      <div><strong>${analysis.correct_count ?? "-"}</strong><span>acertos</span></div>
      <div><strong>${analysis.wrong_count ?? "-"}</strong><span>erros</span></div>
      <div><strong>+35</strong><span>XP</span></div>
    </div>
    <p><b>Para ${STUDENT_NAME}:</b> ${analysis.explanation_student || ""}</p>
    <p><b>Para os pais:</b> ${analysis.explanation_parent || ""}</p>
    ${analysis.matchedAgenda ? `<p class="meta">Bate com a agenda: ${analysis.matchedAgenda.title}.</p>` : ""}
  `;
  toast("Dever analisado. +35 XP e +12 moedas.");
}

function answerQuiz(button) {
  const correct = button.dataset.correct === "true";
  $$("#quizBox button").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.correct === "true") btn.classList.add("correct");
  });
  if (!correct) button.classList.add("wrong");

  const xp = correct ? 20 : 8;
  awardProgress(xp);

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.innerHTML = correct
    ? `<b>Muito bem.</b> Para somar frações diferentes, primeiro igualamos os denominadores. +${xp} XP.`
    : `<b>Boa tentativa.</b> O correto é encontrar um denominador comum antes de somar. +${xp} XP pelo esforço.`;
  $("#quizBox").appendChild(feedback);
}

function startFocus() {
  awardProgress(15);
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

function renderCalendar() {
  $("#calendarItems").innerHTML = studyCalendar.map((item) => `
    <article class="calendar-item ${item.done ? "done" : ""}">
      <div class="calendar-date">
        <strong>${item.day}</strong>
        <span>${item.date}</span>
      </div>
      <div>
        <b>${item.title}</b>
        <p>${item.detail}</p>
        <small>${item.time} • ${calendarTypeLabel(item.type)}</small>
      </div>
      <button data-calendar-id="${item.id}" type="button">${item.done ? "Feito" : "Concluir"}</button>
    </article>
  `).join("");

  const completed = studyCalendar.filter((item) => item.done).length;
  $("#calendarProgress").textContent = `${completed}/${studyCalendar.length}`;
}

function calendarTypeLabel(type) {
  const labels = {
    school: "escolar",
    contest: "concurso",
    review: "revisão"
  };
  return labels[type] || "estudo";
}

function completeCalendarTask(id) {
  const item = studyCalendar.find((entry) => entry.id === Number(id));
  if (!item || item.done) return;
  item.done = true;
  awardProgress(18, 5);
  renderCalendar();
  toast("Bloco concluído. +18 XP e +5 moedas.");
}

async function loadDailyStudy() {
  try {
    const data = await api("/study/daily");
    dailyStudyCache = data.items || [];
  } catch {
    dailyStudyCache = [];
  }
  renderDailyStudy();
}

function renderDailyStudy() {
  const container = $("#dailyStudyItems");
  if (!container) return;

  if (dailyStudyCache.length === 0) {
    container.innerHTML = `<p class="meta">Nenhuma prova ou entrega futura na agenda ainda. Lance uma data em "Escola" para gerar o estudo de hoje.</p>`;
    return;
  }

  container.innerHTML = dailyStudyCache.map((block, blockIndex) => `
    <article class="daily-block">
      <div class="daily-head">
        <div>
          <b>${block.agenda.subject} — ${block.agenda.title}</b>
          <small>${daysUntilLabel(block.daysUntil)}</small>
        </div>
        <span class="days-badge">${formatDate(block.agenda.date)}</span>
      </div>
      <p class="daily-summary">${block.summary}</p>

      <div class="flashcard-row">
        ${(block.flashcards || []).map((card, cardIndex) => `
          <div class="flashcard" data-flash="${blockIndex}-${cardIndex}">
            <div class="front">${card.front}</div>
            <div class="back">${card.back}</div>
            <small>Toque para virar</small>
          </div>
        `).join("")}
      </div>

      <div class="daily-quiz">
        ${(block.quiz || []).map((item, qIndex) => `
          <div class="quiz-card daily-quiz-item" data-quiz-block="${blockIndex}" data-quiz-index="${qIndex}">
            <p class="question">${item.question}</p>
            ${item.options.map((option) => `<button type="button" data-option="${option[0]}">${option}</button>`).join("")}
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function daysUntilLabel(days) {
  if (days <= 0) return "É hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}

function handleDailyStudyClick(event) {
  const flashcard = event.target.closest(".flashcard");
  if (flashcard) {
    flashcard.classList.toggle("flipped");
    const key = `flash-${flashcard.dataset.flash}`;
    if (flashcard.classList.contains("flipped") && !dailyStudyDone.has(key)) {
      dailyStudyDone.add(key);
      awardProgress(5);
      toast("+5 XP por revisar o flashcard.");
    }
    return;
  }

  const optionButton = event.target.closest("[data-option]");
  if (!optionButton) return;

  const card = optionButton.closest(".daily-quiz-item");
  const blockIndex = Number(card.dataset.quizBlock);
  const qIndex = Number(card.dataset.quizIndex);
  const quizItem = dailyStudyCache[blockIndex]?.quiz?.[qIndex];
  if (!quizItem) return;

  const key = `quiz-${blockIndex}-${qIndex}`;
  if (dailyStudyDone.has(key)) return;
  dailyStudyDone.add(key);

  const correctLetter = quizItem.correct;
  const isCorrect = optionButton.dataset.option === correctLetter;

  card.querySelectorAll("[data-option]").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.option === correctLetter) btn.classList.add("correct");
  });
  if (!isCorrect) optionButton.classList.add("wrong");

  const explanation = document.createElement("p");
  explanation.className = "feedback";
  explanation.textContent = quizItem.explanation || "";
  card.appendChild(explanation);

  const xp = isCorrect ? 15 : 5;
  awardProgress(xp);
  toast(`${isCorrect ? "Acertou!" : "Quase!"} +${xp} XP.`);
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

async function addAgendaItem() {
  const item = {
    date: $("#agendaDate").value || new Date().toISOString().slice(0, 10),
    subject: $("#agendaSubject").value || "Matemática",
    title: $("#agendaTitle").value || "Nova atividade"
  };
  await persistOrLocal("/school/agenda", item, () => schoolData.agenda.unshift(item));
  renderSchool();
  toast("Agenda escolar atualizada.");
}

async function addLessonItem() {
  const item = {
    subject: $("#lessonSubject").value || "Matemática",
    topic: $("#lessonTopic").value || "Conteúdo lecionado",
    homework: $("#lessonHomework").value || "Sem dever informado"
  };
  await persistOrLocal("/school/lessons", item, () => schoolData.lessons.unshift(item));
  renderSchool();
  toast("Matéria lecionada registrada.");
}

async function addGradeItem() {
  const item = {
    subject: $("#gradeSubject").value || "Matemática",
    type: $("#gradeType").value || "Avaliação",
    value: Math.max(0, Math.min(10, Number($("#gradeValue").value || 0)))
  };
  await persistOrLocal("/school/grades", item, () => schoolData.grades.unshift(item));
  renderSchool();
  toast("Nota lançada no boletim.");
}

async function persistOrLocal(path, body, localFallback) {
  try {
    await api(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    await loadSchoolDataFromBackend();
  } catch {
    localFallback();
  }
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
    selectedHomeworkFile = file || null;
    $("#fileLabel").textContent = file ? file.name : "Enviar foto ou PDF";
  });

  $$(".subject-pill").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".subject-pill").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      selectedSubject = button.dataset.subject || "";
    });
  });

  $("#analyzeBtn").addEventListener("click", analyzeHomework);
  $("#focusBtn").addEventListener("click", startFocus);
  $("#parentReport").addEventListener("click", generateReport);
  $("#teacherPlan").addEventListener("click", createTeacherPlan);
  $("#adminAudit").addEventListener("click", runAdminAudit);
  $("#contestExamBtn").addEventListener("click", generateContestExam);
  $("#libraryFilter").addEventListener("change", (event) => renderLibrary(event.target.value));
  $("#librarySampleBtn").addEventListener("click", importDemoPackage);
  $("#libraryImportBtn").addEventListener("click", importLibraryPackage);
  $("#libraryItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-library-id]");
    if (button) activateLibraryItem(button.dataset.libraryId);
  });
  $("#addAgendaItem").addEventListener("click", addAgendaItem);
  $("#addLessonItem").addEventListener("click", addLessonItem);
  $("#addGradeItem").addEventListener("click", addGradeItem);
  $("#calendarItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-id]");
    if (button) completeCalendarTask(button.dataset.calendarId);
  });
  $("#dailyStudyItems").addEventListener("click", handleDailyStudyClick);
  $$("[data-school-tab]").forEach((button) => {
    button.addEventListener("click", () => setSchoolTab(button.dataset.schoolTab));
  });

  $$("#quizBox button").forEach((button) => {
    button.addEventListener("click", () => answerQuiz(button));
  });
}

renderSubjects();
renderContest();
renderLibrary();
renderSchool();
renderWeek();
renderCalendar();
updateStats();
bind();
loadSchoolDataFromBackend();
loadDailyStudy();
loadProgress();

try {
  const savedSession = JSON.parse(localStorage.getItem("educa7_session"));
  if (savedSession?.role) applySession(savedSession);
} catch {
  localStorage.removeItem("educa7_session");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // instalação como PWA fica indisponível, mas o app segue funcionando normalmente
    });
  });
}
