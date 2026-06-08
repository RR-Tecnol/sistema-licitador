# Sistema de Monitoramento de Licitações (LicitAlert)

Sistema web interno para monitoramento e tomada de decisão sobre licitações públicas de TI a partir de dados consolidados do Excel.

## Estrutura do Projeto

- `/database`: Schema do banco de dados (MySQL) e migrações do Prisma.
- `/backend`: API REST construída com Node.js, Express, TypeScript e Prisma ORM.
- `/frontend`: Interface do usuário construída com React 18, Vite, TypeScript e TailwindCSS.

---

## Requisitos Prévios

- **Node.js**: Versão 18 ou superior.
- **MySQL**: Banco de dados relacional (porta padrão `3306`).

---

## Instruções de Setup

### 1. Banco de Dados

1. Certifique-se de que a sua instância local do MySQL está em execução na porta `3306`.
2. Acesse a pasta `/database` e configure as credenciais de conexão no arquivo `.env`:
   ```env
   DATABASE_URL="mysql://root@localhost:3306/licitacoes_db"
   ```
   *(Substitua `root` e a senha caso sua instância necessite de autenticação)*.

3. Instale as dependências e execute as migrations para criar as tabelas no banco de dados:
   ```bash
   npm install
   npm run migrate:dev
   ```

4. Gere o Prisma Client local na pasta `/database`:
   ```bash
   npm run generate
   ```

---

### 2. Backend

1. Acesse a pasta `/backend` e crie um arquivo `.env` com a seguinte configuração:
   ```env
   DATABASE_URL="mysql://root@localhost:3306/licitacoes_db"
   PORT=3333
   ```
2. Instale as dependências (isso irá linkar automaticamente o pacote local `/database` gerado anteriormente):
   ```bash
   npm install
   ```
3. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   A API estará disponível em `http://localhost:3333`.

---

### 3. Frontend

1. Acesse a pasta `/frontend` e crie um arquivo `.env` configurando a URL da API:
   ```env
   VITE_API_URL="http://localhost:3333"
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação web estará acessível em `http://localhost:5173`.

---

## Planilha de Testes/Validação

O projeto contém uma planilha Excel de exemplo para importação localizada na raiz:
- `boletim_web_Licitacoes_e_Acompanhamentos.xlsx`

Você pode acessar a página **"Importar Planilha"** no frontend e enviar este arquivo para popular a base de dados.
