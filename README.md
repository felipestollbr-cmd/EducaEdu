# EducaEdu

Plataforma EducaEdu: uma experiência gamificada de estudos para crianças, família, escola e
preparação para concursos, com backend real (Gemini + RAG) e frontend instalável como PWA
(computador, tablet e celular).

## Recursos atuais

- Login demonstrativo por perfil: aluno, pais, professor e administrador.
- Envio de dever de casa com análise por IA (Gemini Vision + RAG sobre o material didático real).
- Estudo do dia com flashcards e quiz gerados a partir da agenda escolar.
- XP, moedas e streak persistidos no backend.
- Calendário inteligente com blocos escolares, revisão espaçada e concurso.
- Biblioteca de conteúdos para organizar slides, PDFs e pacotes JSON.
- Quiz interativo.
- Módulo Concurso/DATAPREV com trilha, prioridades do edital e simulado demonstrativo com Gemini.
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

## Credenciais de demonstração

- Aluno: `sofia@educa7.ai` / `aluno123`
- Pais: `pais@educa7.ai` / `pais123`
- Professor: `prof@educa7.ai` / `prof123`
- Admin: `admin@educa7.ai` / `admin123`

## Arquitetura atual do backend

```
backend/
  src/
    server.js          # Express: serve o frontend estático + monta as rotas da API
    db.js               # node:sqlite — schema e seed (substitui os mocks do app.js)
    routes/
      homework.js        # POST /api/homework/analyze (foto -> Gemini Vision -> RAG -> correção)
      school.js           # CRUD de agenda, matérias lecionadas e boletim
      study.js             # GET /api/study/daily (agenda + RAG -> flashcards e quiz do dia)
    services/
      gemini.js           # cliente Gemini + embeddings + parsing de JSON da resposta
      rag.js               # busca por similaridade nos trechos do livro didático
      ingestBook.js         # script CLI: PDF do livro -> chunks -> embeddings -> SQLite
```

O frontend (`app.js`) já está ligado a essas rotas: se o backend não estiver no ar,
ele cai de volta no comportamento mockado original, então nada quebra durante o
desenvolvimento.

## Próximos passos técnicos

- Autenticação real (hoje o login ainda é uma lista fixa de credenciais demo).
- Correlacionar automaticamente o dever enviado com o item da agenda daquele dia (comparação por matéria já existe; falta por conteúdo/tópico).
- Conversor de material/edital em pacote JSON genérico (hoje o pacote é montado manualmente; a ideia é generalizar de DATAPREV para qualquer concurso).
- Repetição espaçada, badges e loja de recompensas.
- Multi-tenant (uma instância por família/escola) para virar SaaS.
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
