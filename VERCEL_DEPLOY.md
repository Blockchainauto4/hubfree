# Guia de Deploy na Vercel com Vercel Postgres (100% Vercel Nativo)

Este projeto foi reestruturado para utilizar **exclusivamente os serviços nativos da Vercel**, sem qualquer dependência do Firebase ou de serviços externos.

---

## 1. Arquitetura 100% Vercel

- **Frontend**: Single Page Application (SPA) com React 19 + Vite + Tailwind CSS.
- **Serverless API**: Rotas `/api/tasks`, `/api/submissions` e `/api/users` executadas nativamente nas Vercel Serverless Functions.
- **Banco de Dados**: **Vercel Postgres (Neon)** com conexão otimizada via connection-pooling e execução rápida de queries.
- **Configuração de Rotas**: `vercel.json` na raiz com roteamento automático.

---

## 2. Passo a Passo para Configurar o Vercel Postgres

1. Acesse o seu dashboard na [Vercel](https://vercel.com) e entre no seu projeto.
2. Clique na aba **Storage** no topo.
3. Clique em **Create Database** e selecione **Postgres** (Vercel Postgres powered by Neon).
4. Aceite os termos e crie o banco (plano gratuito disponível).
5. As variáveis de ambiente (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.) serão vinculadas automaticamente ao seu projeto!
6. Clique na aba **Query** dentro da página do seu banco no painel da Vercel e cole o conteúdo do arquivo **`schema.sql`**:
   - Cria a tabela `tasks` (com índices de busca rápida e suporte a bônus em vídeo).
   - Cria a tabela `submissions` (para auditoria dos vídeos enviados e chave PIX).
   - Cria a tabela `users` (para contas de freelancers e empresas).
   - Cria a tabela `wallet_transactions` (para controle de saques PIX).
7. Clique em **Run Query**. Pronto! Seu banco relacional está ativo.

---

## 3. Assistente IA Gemini & Painel Administrativo em Tempo Real

O projeto inclui o **Assistente IA FreelaHub** integrado ao modelo `gemini-3.8-flash` e uma **Área Administrativa Integrada**:
- **Botão Admin no Topo da Aplicação**: Permite alterar o prompt do sistema (*System Instructions*), temperatura, nome do assistente, mensagem de boas-vindas e perguntas frequentes.
- **Configurações em Tempo Real**: As alterações têm efeito imediato na aplicação sem precisar reescrever código ou abrir o AI Studio toda vez.
- **Controle de Negócio & Moderação**: Permite alterar o valor base da hora, bônus padrão, ativar/desativar aprovação automática de PIX e moderar submissões de vídeo dos freelancers.
- Rota Serverless: `/api/gemini`
- Na Vercel, caso deseje usar sua própria chave da Google AI Studio, basta adicionar a variável de ambiente:
  ```env
  GEMINI_API_KEY="sua_chave_aqui"
  ```

---

## 4. Como Fazer o Deploy do Projeto

### Opção 1: Via GitHub (Recomendado)
```bash
git add .
git commit -m "Deploy FreelaHub com Vercel Postgres nativo"
git push origin main
```
Ao enviar o código, a Vercel executará o build automaticamente e disponibilizará o site em produção.

### Opção 2: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```
