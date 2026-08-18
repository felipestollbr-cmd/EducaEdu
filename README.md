# EducaEdu

Plataforma EducaEdu: uma experiência gamificada de estudos para crianças, família, escola e
preparação para concursos, com backend real (Gemini + RAG) e frontend instalável como PWA
(computador, tablet e celular).

## Recursos atuais

- **Contas reais**: cadastro e login com e-mail/senha (senha com hash `scrypt`, sem
  depender de credenciais fixas). Perfis: aluno, pais, professor e administrador.
- **Aluno escolhe a trilha no cadastro**: Escola (rotina e dever de casa) ou Concurso
  (edital, simulados, estudo por conta própria) — isso já define a tela inicial.
- **Escolas e cursinhos cadastráveis**: aluno e professor podem vincular a conta a uma
  escola/cursinho existente ou cadastrar um novo direto no formulário de conta.
- Envio de dever de casa com análise por IA (Gemini Vision + RAG sobre o material didático real).
- **Modo socrático** no dever de casa: em vez de corrigir e dar a resposta, a IA devolve uma
  pergunta-guia (+ dica) para a criança pensar sozinha, alternando com o modo "corrigir e explicar".
- Estudo do dia com flashcards e quiz gerados a partir da agenda escolar.
- XP, moedas e streak persistidos no backend.
- Calendário inteligente com blocos escolares, revisão espaçada e concurso.
- Biblioteca de conteúdos persistida no backend, com pacotes JSON e **compartilhamento por
  link** (`?pacote=<id>`) que importa a trilha automaticamente para quem abre o link.
- Quiz interativo.
- Módulo Concurso com trilha, prioridades do edital e simulado real via Gemini (RAG) para
  **qualquer concurso ou matéria**, não só DATAPREV — o campo é livre. Dá para **subir o
  edital ou material de estudo em PDF** direto na tela, que vira base real dos simulados.
- Módulo Escola com agenda, matérias lecionadas e boletim.
- Simulação semanal da Sofia com visão do professor, aluno e pais.
- Painel dos pais.
- Área do professor.
- Área administrativa.
- Tema claro/escuro.
- **PWA instalável e responsiva**: shell próprio (sem moldura de celular), sidebar no
  desktop/tablet paisagem, barra inferior no celular/tablet retrato, service worker com
  cache do app shell para abrir offline.

## Como abrir localmente

Agora o EducaEdu tem um backend real (Node.js + SQLite) que serve o frontend estático
e expõe a API de dever de casa, agenda e estudo diário.

```bash
cd backend
npm install
cp .env.example .env   # depois edite e cole sua GEMINI_API_KEY
npm start
```

Abra http://localhost:3000. Sem `GEMINI_API_KEY` configurada, o app roda em **modo
demonstração** (respostas mockadas) — tudo funciona igual, só a correção não é real.

### Ligar a IA de verdade (Gemini)

1. Gere uma chave gratuita em https://aistudio.google.com/apikey.
2. Cole em `backend/.env` na variável `GEMINI_API_KEY`.
3. Reinicie o servidor (`npm start`).

### Ensinar a IA com o material didático real (RAG)

Para que a correção do dever e o material de estudo diário usem o conteúdo real dos
livros que seus filhos usam (ex: Sistema Positivo), ingira o PDF do livro:

```bash
cd backend
node src/services/ingestBook.js ./books/matematica-7ano.pdf "Sistema Positivo - Matemática 7º ano" Matemática
```

Isso quebra o PDF em trechos, gera embeddings e salva no banco local. A partir daí,
`/api/homework/analyze` e `/api/study/daily` buscam automaticamente os trechos mais
relevantes do livro para embasar a explicação — a criança recebe uma explicação
fiel ao material que ela usa em sala, não uma resposta genérica.

## Contas, trilhas e escolas

Não existe mais login demo — a tela inicial tem abas "Entrar" / "Criar conta". Ao criar
conta:

- **Nome, e-mail e senha** (mínimo 6 caracteres) são obrigatórios.
- **Perfil**: aluno, pais, professor ou administrador.
- **Aluno** escolhe a trilha — **Escola** ou **Concurso** — o que já define a tela para
  onde ele cai ao entrar (Início ou Concurso).
- **Aluno e professor** podem vincular a conta a uma escola/cursinho: selecionar uma já
  cadastrada ou cadastrar uma nova (nome, tipo — escola ou cursinho — e cidade) sem sair
  do formulário.

⚠️ Limitação atual: a sessão é o próprio objeto retornado pelo login/cadastro, guardado no
`localStorage` do navegador — não há token assinado nem expiração. Suficiente para uso
familiar/local, mas antes de expor a instância publicamente vale adicionar um mecanismo de
sessão de verdade (JWT ou cookie assinado).

## Arquitetura atual do backend

```
backend/
  src/
    server.js          # Express: serve o frontend estático + monta as rotas da API
    db.js               # node:sqlite — schema e seed (substitui os mocks do app.js)
    routes/
      auth.js            # POST /api/auth/register e /api/auth/login (senha com hash scrypt)
      schools.js           # GET/POST /api/schools — cadastro de escolas e cursinhos
      homework.js            # POST /api/homework/analyze (foto -> Gemini Vision -> RAG -> correção ou pergunta socrática)
      school.js                # CRUD de agenda, matérias lecionadas e boletim (ainda não filtrado por escola/turma)
      study.js                   # GET /api/study/daily (agenda + RAG -> flashcards e quiz do dia)
      contest.js                   # GET /api/contest/exam + POST /api/contest/materials (upload de edital/PDF -> RAG)
      library.js                     # CRUD de pacotes de conteúdo (Biblioteca), base do compartilhamento por link
      progress.js                     # XP, moedas e streak por aluno
    services/
      gemini.js           # cliente Gemini + embeddings + parsing de JSON da resposta
      password.js           # hash/verificação de senha (node:crypto scrypt, sem dependência extra)
      rag.js                  # busca por similaridade nos trechos do livro/edital
      ingest.js                 # PDF -> chunks -> embeddings -> SQLite (usado pelo CLI e pelo upload web)
      ingestBook.js               # script CLI que chama ingest.js
```

O frontend (`app.js`) já está ligado a essas rotas: se o backend não estiver no ar,
ele cai de volta no comportamento mockado original, então nada quebra durante o
desenvolvimento.

## Próximos passos técnicos

- Sessão de verdade (JWT/cookie assinado) no lugar do objeto de sessão cru no `localStorage`.
- Isolar dados por conta/escola: hoje agenda, boletim e progresso não são filtrados por `school_id` — todo mundo vê a mesma agenda global.
- Correlacionar automaticamente o dever enviado com o item da agenda daquele dia (comparação por matéria já existe; falta por conteúdo/tópico).
- Conversor de material/edital em pacote JSON automaticamente para a Biblioteca (hoje o upload de PDF já alimenta o RAG do simulado, mas não vira pacote/trilha sozinho).
- Repetição espaçada, badges e loja de recompensas.
- Multi-tenant (uma instância por família/escola) para virar SaaS — a base de `schools` já existe, falta isolar os dados por ela.
- Preparar deploy em AWS ou alternativa equivalente (ver observações de segurança da conta AWS usada nos testes).

## PWA e responsividade

O app roda em três layouts, todos usando o mesmo HTML/CSS/JS (sem duplicar telas):

- **Celular (<900px)**: navegação em barra inferior fixa.
- **Tablet retrato / telas médias (900–1279px)**: navegação em sidebar fixa à esquerda.
- **Desktop / tablet paisagem (≥1280px)**: sidebar + painel lateral direito com atalhos.

Para instalar como app: abra o site pelo Chrome/Edge (desktop ou Android) e use "Instalar
app"/"Adicionar à tela inicial". No iOS/Safari, use Compartilhar → "Adicionar à Tela de
Início". Os ícones ficam em `icons/`, o manifesto em `manifest.json` e o service worker
(cache do app shell para abrir offline) em `sw.js`.

## Formato inicial de pacote JSON

Use este formato para transformar materiais em trilhas gamificadas:

```json
{
  "nome": "DATAPREV - Segurança Cibernética",
  "tipo": "concurso",
  "dono": "Felipe",
  "formato": "JSON + slides",
  "descricao": "Trilha baseada no edital, com módulos, revisões e questões.",
  "modulos": [
    {
      "nome": "LGPD",
      "licoes": ["Fundamentos", "Bases legais", "Direitos do titular"],
      "questoes": [
        {
          "enunciado": "A LGPD se aplica somente a empresas públicas.",
          "gabarito": "Errado"
        }
      ]
    }
  ]
}
```
