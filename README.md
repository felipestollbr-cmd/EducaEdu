# Educa7 AI

MVP web responsivo da plataforma Educa7 AI.

## Recursos atuais

- Login demonstrativo por perfil: aluno, pais, professor e administrador.
- Envio simulado de dever de casa com análise por IA.
- Plano de estudos diário.
- Quiz interativo.
- Módulo Escola com agenda, matérias lecionadas e boletim.
- Simulação semanal da Sofia com visão do professor, aluno e pais.
- Painel dos pais.
- Área do professor.
- Área administrativa.
- Gamificação com XP e moedas.

## Como abrir localmente

Basta servir os arquivos estáticos e abrir `index.html`.

Exemplo:

```bash
python3 -m http.server 3000
```

## Credenciais de demonstração

- Aluno: `sofia@educa7.ai` / `aluno123`
- Pais: `pais@educa7.ai` / `pais123`
- Professor: `prof@educa7.ai` / `prof123`
- Admin: `admin@educa7.ai` / `admin123`

## Próximos passos técnicos

Para hospedagem futura na AWS, recomenda-se evoluir para:

- Amazon Cognito para autenticação;
- S3 + CloudFront para frontend estático;
- API Gateway + Lambda ou ECS para backend;
- DynamoDB ou PostgreSQL/RDS para dados;
- S3 para arquivos enviados;
- serviço de IA/OCR para análise real dos deveres;
- banco vetorial para RAG escolar.
# EducaEdu
