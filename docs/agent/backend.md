## Endpoints da API

### Importação

POST   /api/import
       Content-Type: multipart/form-data
       Campo do arquivo: "arquivo" (.xlsx)
       Middleware: multer (campo "arquivo", arquivo único)
       Processa o arquivo Excel e persiste no banco seguindo as regras
       definidas em database.md (upsert por id, órfãos ignorados).
       Ordem obrigatória de operação: importar Licitacoes primeiro,
       Acompanhamentos depois — garante que a verificação de licitacaoId
       existente funcione corretamente.
       Retorna: { importados: number, atualizados: number, ignorados: number }

       Conversão de datas:
       O arquivo Excel armazena datas como números seriais (ex: 46150.39).
       A biblioteca xlsx deve ser inicializada com { cellDates: true } para
       converter automaticamente esses valores em objetos Date do JavaScript
       antes de persistir no banco.

       Normalização de colunas:
       Antes do mapeamento, todos os nomes de colunas do arquivo Excel devem
       ser normalizados com a seguinte sequência:
       1. Remover acentos (NFD + remoção de caracteres combinantes)
       2. Converter para minúsculas
       3. Remover espaços

       Exemplos:
       "Número ConLicitação" → "numeroconlicitacao"
       "Órgão"              → "orgao"
       "Valor Estimado"     → "valorestimado"
       "Atualizada em"      → "atualizadaem"
       "Data Fonte"         → "datafonte"
       "Licitação Referente"→ "licitacaoreferente"

       Mapeamento de colunas — aba Licitações:
       "numeroconlicitacao" → id
       "codigo"             → codigo
       "orgao"              → orgao
       "endereco"           → endereco
       "cidade"             → cidade
       "estado"             → estado
       "cep"                → cep
       "edital"             → edital
       "processo"           → processo
       "valorestimado"      → valorEstimado
       "itens"              → itens
       "situacao"           → situacao
       "documento"          → dataDocumento
       "abertura"           → dataAbertura
       "prazo"              → dataPrazo
       "objeto"             → objeto
       "observacao"         → observacao
       "anexos"             → editalUrl
       "atualizadaem"       → atualizadaEm

       Mapeamento de colunas — aba Acompanhamentos:
       "numeroconlicitacao" → id
       "orgao"              → orgao
       "cidade"             → cidade
       "estado"             → estado
       "edital"             → edital
       "processo"           → processo
       "datafonte"          → dataFonte
       "objeto"             → objeto
       "sintese"            → sintese
       "licitacaoreferente" → licitacaoId

       Colunas presentes no arquivo mas ausentes no mapeamento
       (ex: "site1", "site2") devem ser ignoradas silenciosamente.

       Identificação das abas no Excel:
       - O parser localiza as planilhas pelas abas com nomes exatos:
         - Aba de Licitações: "Licitações"
         - Aba de Acompanhamentos: "Acompanhamentos"
       - Se uma aba esperada estiver ausente, a requisição deve falhar com status 422.

       Validação do enum "situacao":
       - O valor lido da coluna "situacao" da aba "Licitações" deve ser normalizado
         removendo espaços extras (`trim`) e convertendo para letras maiúsculas (`toUpperCase`).
       - Se o valor obtido não corresponder a nenhum membro válido do enum `SituacaoLicitacao`
         (definido em `database.md`), a linha inteira correspondente a essa licitação
         deve ser ignorada (não persistida/atualizada) e somada ao contador `ignorados` da
         resposta `ImportResponse`. Acompanhamentos associados a essa licitação ignorada
         serão considerados órfãos e também ignorados.

---

### Licitações

GET    /api/licitacoes
       Query params:
       ?situacao=     (valor do enum SituacaoLicitacao)
       ?estado=       (UF)
       ?q=            (busca textual via LIKE %termo% em objeto e orgao)
       ?decisao=      (participando | declinado — filtra por decisão registrada)
       ?ordenar=      dataPrazo | valorEstimado | atualizadaEm
       ?page=         (padrão: 1)
       ?limit=        (padrão: 10)
       Inclui relação: { interesse: true }
       Retorna: PaginatedResponse<Licitacao>

       Regras de ordenação:
       - Registros com o campo ordenado nulo aparecem sempre ao final
       - Ordenação padrão (sem ?ordenar): dataPrazo ASC nulls last

GET    /api/licitacoes/:id
       Retorna: Licitacao com acompanhamentos e interesse vinculados
       Inclui relações: { acompanhamentos: true, interesse: true }
       Acompanhamentos ordenados por dataFonte ASC

---

### Interesses

GET    /api/interesses
       Retorna: Interesse[] com licitacao incluída

POST   /api/interesses
       Usa upsert: cria ou substitui decisão existente para o licitacaoId
       Body validado pelo seguinte schema Zod:

       const interesseSchema = z.object({
         licitacaoId: z.string().min(1),
         decisao:     z.nativeEnum(Decisao),
       })

DELETE /api/interesses/:licitacaoId
       Remove a decisão da licitação

---

### Respostas de Erro

Todos os endpoints retornam erros no seguinte formato:

       { "error": "mensagem descritiva" }

Mapeamento de status HTTP:
- 400  Body ou query params inválidos (falha na validação Zod)
- 404  Recurso não encontrado (licitação ou interesse inexistente)
- 422  Arquivo enviado em formato inválido ou corrompido (import)
- 500  Erro inesperado no banco ou no servidor

---

## Arquitetura do Backend

Separar responsabilidades em três camadas:

- routes/    — definição de rotas e validação Zod da entrada
- services/  — lógica de negócio e consultas Prisma
- middleware/ — tratamento centralizado de erros, CORS, tipagem de Request

O cliente Prisma deve ser instanciado uma única vez e exportado como
singleton (lib/prisma.ts).

O schema Prisma está em database/prisma/schema.prisma, fora do diretório
do backend. O package.json do backend deve conter o seguinte script para
gerar o Prisma Client corretamente:

       "scripts": {
         "generate": "prisma generate --schema=../database/prisma/schema.prisma"
       }

Este comando deve ser executado antes de iniciar o backend pela primeira
vez e sempre que o schema for alterado.

CORS deve ser configurado para aceitar requisições exclusivamente
da origem definida na variável de ambiente própria do backend chamada
`CORS_ORIGIN` (ex.: `CORS_ORIGIN="http://localhost:5173"`), nunca de `VITE_API_URL`.