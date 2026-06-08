## Banco de Dados

Banco: MySQL
ORM:   Prisma

### Schema (prisma/schema.prisma)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum SituacaoLicitacao {
  URGENTE
  NOVA
  ADIADA
  PRORROGADA
  ALTERADA
  REVOGADA
  EDITAL
}

enum Decisao {
  participando
  declinado
}

model Licitacao {
  id            String            @id
  codigo        String?
  orgao         String
  endereco      String?
  cidade        String
  estado        String            @db.Char(2)
  cep           String?           @db.VarChar(9)
  edital        String
  processo      String?
  valorEstimado Decimal?          @db.Decimal(15, 2)
  itens         String?           @db.LongText
  situacao      SituacaoLicitacao
  dataDocumento DateTime?
  dataAbertura  DateTime?
  dataPrazo     DateTime?
  objeto        String            @db.Text
  observacao    String?           @db.LongText
  editalUrl     String?
  atualizadaEm  DateTime

  acompanhamentos Acompanhamento[]
  interesse       Interesse?

  @@index([situacao])
  @@index([estado])
  @@index([dataPrazo])
  @@index([atualizadaEm])
  @@index([valorEstimado])
}

model Acompanhamento {
  id          String   @id
  licitacaoId String
  orgao       String
  cidade      String
  estado      String   @db.Char(2)
  edital      String
  processo    String?
  dataFonte   DateTime
  objeto      String   @db.Text
  sintese     String   @db.LongText

  licitacao   Licitacao @relation(fields: [licitacaoId], references: [id])
}

model Interesse {
  licitacaoId String   @id
  marcadoEm   DateTime
  decisao     Decisao

  licitacao   Licitacao @relation(fields: [licitacaoId], references: [id])
}

---

### Regras de Persistência

#### Importação via Excel

- Licitacoes e Acompanhamentos são persistidos exclusivamente via
  importação de arquivo Excel. Nenhuma rota da API cria, edita ou
  exclui esses registros diretamente.
- A importação usa upsert por id: se o registro já existir no banco,
  seus campos são atualizados com os dados do arquivo. Se não existir,
  é criado.
- Acompanhamentos órfãos (cujo licitacaoId não existe na tabela
  Licitacao) devem ser ignorados silenciosamente durante a importação.
- A tabela Interesse não é afetada pela importação. Decisões
  registradas pelo usuário são preservadas mesmo quando a licitação
  correspondente é reimportada.

---

### Migrations

- Rodar a partir de database/ com: npx prisma migrate dev
- O diretório database/prisma/migrations/ é gerenciado exclusivamente
  pelo Prisma. Nunca editar arquivos de migration manualmente.
- Após as migrations, todas as tabelas estarão criadas e vazias,
  prontas para receber dados via importação de arquivo Excel.