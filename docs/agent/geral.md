## Contexto do Projeto

Sistema web interno para um funcionário de uma pequena empresa de
desenvolvimento de software que monitora licitações públicas de TI.
O usuário analisa os editais disponíveis e decide quais representam
oportunidades viáveis para a empresa participar.

Os dados são importados para o banco de dados a partir de um arquivo
Excel (.xlsx) enviado pelo usuário através de uma página no frontend,
que utiliza uma rota dedicada da API para processamento e persistência.
O frontend se comunica exclusivamente com o backend, que é responsável
por todas as consultas ao banco.

---

## Escopo do Sistema

### O sistema faz:
- Importar licitações e acompanhamentos a partir de arquivo Excel
- Exibir e filtrar licitações cadastradas no banco
- Registrar e persistir decisões do usuário sobre cada licitação

### O sistema não faz:
- Autenticar usuários
- Consumir APIs externas de licitações diretamente
- Editar ou excluir registros de Licitacao ou Acompanhamento
- Enviar notificações ou alertas externos
- Suportar múltiplos usuários ou empresas simultaneamente
- Gerar relatórios exportáveis

---

## Fluxo de Dados

- Excel (.xlsx) enviado pelo usuário via página do frontend
- POST /api/import recebe e processa o arquivo no backend
- Licitacoes e Acompanhamentos são persistidos no MySQL (tabelas read-only)
- Frontend consulta dados via TanStack Query nos endpoints REST do backend
- Backend responde com dados lidos do MySQL via Prisma ORM
- Decisões do usuário são enviadas via POST /api/interesses
- Interesse é persistido no MySQL (única tabela gravável pela aplicação)

---

## Stack Tecnológica

Frontend:  React 18 + Vite + TypeScript + TailwindCSS
           TanStack Query + React Router v6
           axios (cliente HTTP)

Backend:   Node.js + Express + TypeScript
           Prisma ORM + MySQL
           Zod (validação de entrada)
           multer (upload de arquivos multipart/form-data)
           xlsx (leitura do arquivo Excel na importação)

---

## Variáveis de Ambiente

Devem existir arquivos de exemplo versionados no repositório:
- `backend/.env.example` contendo `DATABASE_URL`, `PORT` e `CORS_ORIGIN`.
- `frontend/.env.example` contendo `VITE_API_URL`.

O setup do ambiente deve iniciar copiando esses arquivos de exemplo para os respectivos arquivos `.env` antes de rodar migrations ou iniciar os servidores:
- No backend: `cp backend/.env.example backend/.env`
- No frontend: `cp frontend/.env.example frontend/.env`

### Backend (backend/.env)
DATABASE_URL="mysql://user:password@localhost:3306/licitacoes_db"
PORT=3333
CORS_ORIGIN="http://localhost:5173"

### Frontend (frontend/.env)
VITE_API_URL="http://localhost:3333"

---

## Setup & Execução

Esta seção consolida a ordem exata de comandos para configurar e executar o projeto localmente. O runtime obrigatório é o **Node.js LTS (versão 20.x)** e o gerenciador de pacotes é o **npm**.

### Ordem de Execução

1. **Copiar arquivos de configuração de ambiente (`.env`)**
   Copie os arquivos de exemplo para as configurações ativas:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   Ajuste as variáveis conforme sua infraestrutura local (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

2. **Instalar dependências**
   Instale as dependências de cada camada separadamente:
   - No backend:
     ```bash
     cd backend
     npm install
     ```
   - No frontend:
     ```bash
     cd frontend
     npm install
     ```

3. **Gerar o Prisma Client**
   No diretório `backend/`, gere o cliente do Prisma ORM:
   ```bash
   cd backend
   npm run generate
   ```
   *(Consulte [Arquitetura do Backend](backend.md#arquitetura-do-backend) para detalhes sobre este script)*

4. **Rodar migrations do banco de dados**
   Execute as migrations a partir de `database/` para estruturar o banco de dados MySQL:
   ```bash
   cd database
   npx prisma migrate dev
   ```
   *(Consulte [Migrations](database.md#migrations) para detalhes adicionais)*

5. **Iniciar os serviços**
   Inicie primeiro o backend e, em seguida, o frontend:
   - **Backend** (executando na porta definida em `PORT` no `backend/.env` — padrão `3333`):
     ```bash
     cd backend
     npm run dev
     ```
   - **Frontend** (servidor de desenvolvimento do Vite executando em `http://localhost:5173` por padrão):
     ```bash
     cd frontend
     npm run dev
     ```

---

## Estrutura de Pastas

/
├── docs/
│   ├── agent/          # Documentação consumida por agentes de IA
│   │   ├── geral.md
│   │   ├── database.md
│   │   ├── backend.md
│   │   ├── frontend.md
│   │   ├── typings.md
│   │   └── requisitos.md
│   └── dev/            # Documentação consumida por desenvolvedores humanos
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
├── backend/
│   └── src/
│       ├── lib/
│       │   └── prisma.ts
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── types/
└── database/
    └── prisma/
        ├── schema.prisma
        └── migrations/

---

## Ordem de Leitura

O agente deve ler os documentos em docs/agent/ na seguinte ordem
antes de iniciar qualquer implementação:

1. geral.md      — visão geral, fluxo de dados e escopo
2. database.md   — schema, modelos e regras de persistência
3. typings.md    — interfaces e tipos compartilhados entre camadas
4. backend.md    — arquitetura, endpoints e regras de negócio
5. frontend.md   — funcionalidades, componentes e comportamento da UI
6. requisitos.md — requisitos funcionais e não funcionais