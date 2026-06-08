## Requisitos do Sistema

---

## Requisitos Funcionais

### Importação de Excel

RF01 — O sistema deve disponibilizar uma página dedicada no frontend
       para upload de arquivo .xlsx

RF02 — O frontend deve enviar o arquivo via POST /api/import usando
       multipart/form-data

RF03 — O backend deve processar o arquivo Excel com { cellDates: true }
       para converter datas seriais em objetos Date antes de persistir

RF04 — A importação deve processar Licitacoes antes de Acompanhamentos

RF05 — Licitacoes e Acompanhamentos são populados exclusivamente via
       importação de arquivo Excel. Nenhuma rota da API pode criar,
       editar ou excluir esses registros diretamente

RF06 — A importação deve usar upsert por id em Licitacao e Acompanhamento

RF07 — Acompanhamentos cujo licitacaoId não existe em Licitacao devem
       ser ignorados silenciosamente

RF08 — A importação não deve afetar registros existentes na tabela Interesse

RF09 — O frontend deve exibir estado de carregamento e bloquear novo
       envio enquanto a importação estiver em andamento

RF10 — Em caso de sucesso, o frontend deve exibir os contadores
       importados, atualizados e ignorados retornados pela API

RF11 — Em caso de erro, o frontend deve exibir a mensagem retornada
       pela API

---

### Listagem de Licitações

RF12 — O sistema deve exibir licitações em cards contendo: número do
       edital, órgão, cidade/estado, objeto truncado em 2 linhas,
       badge de situação, valor estimado em BRL e dataPrazo

RF13 — O sistema deve exibir tabs "Todas", "Participando" e "Declinadas"
       no topo da listagem

RF14 — Cada tab deve manter filtros, ordenação e paginação próprios e
       independentes entre si

RF15 — O sistema deve suportar filtro por situacao e por estado (UF)

RF16 — O sistema deve suportar busca textual em objeto e orgao com
       debounce de 300ms

RF17 — O sistema deve suportar ordenação por dataPrazo (padrão),
       valorEstimado e atualizadaEm

RF18 — Registros com o campo ordenado nulo devem aparecer ao final

RF19 — O sistema deve paginar os resultados em 10 itens por página,
       retornando total, page, limit e totalPages

RF20 — O badge de situação deve exibir cor distinta para cada valor
       do enum SituacaoLicitacao

RF21 — O badge de urgência deve ser exibido quando situacao === URGENTE
       ou dataPrazo estiver nos próximos 3 dias, calculado no momento
       da renderização

---

### Decisão de Participação

RF22 — Cada card deve exibir os botões "Participar" e "Declinar"

RF23 — Clicar em "Participar" deve chamar POST /api/interesses com
       decisao: "participando"

RF24 — Clicar em "Declinar" deve chamar POST /api/interesses com
       decisao: "declinado"

RF25 — Clicar no botão correspondente à decisão já registrada deve
       chamar DELETE /api/interesses/:licitacaoId

RF26 — Após POST ou DELETE em /api/interesses, o frontend deve
       invalidar as query keys ['licitacoes'] e ['interesses']

RF27 — Cards com decisão registrada devem exibir borda colorida e
       ícone de status: verde para "participando", vermelho para
       "declinado"

---

### Detalhe da Licitação

RF28 — Clicar em um card deve abrir modal com todos os campos de
       Licitacao que possuem valor

RF29 — Campos opcionais nulos devem ser omitidos no modal

RF30 — O modal deve exibir Acompanhamentos em timeline ordenada
       por dataFonte ASC

RF31 — O modal deve exibir o botão "Abrir Edital" quando editalUrl
       for não nulo, abrindo a URL em nova aba

RF32 — O modal deve exibir a data e hora da decisão registrada
       (marcadoEm) quando houver interesse vinculado

---

## Requisitos Não Funcionais

### Isolamento de Código

RNF01 — Nenhum arquivo dentro de frontend/ pode referenciar arquivos
        fora de frontend/

RNF02 — Nenhum arquivo dentro de backend/ pode referenciar arquivos
        fora de backend/

RNF03 — Nenhum arquivo dentro de database/ pode referenciar arquivos
        fora de database/

---

### Configuração

RNF04 — O frontend deve consumir VITE_API_URL como base de todas as
        chamadas HTTP; nenhuma URL do backend pode estar hardcoded

RNF05 — O backend deve consumir DATABASE_URL, PORT e CORS_ORIGIN exclusivamente
        via variáveis de ambiente (backend/.env)

---

### Interface e Experiência

RNF06 — Skeleton loading deve ser exibido nos cards durante o
        carregamento dos dados

RNF07 — Feedback de toast deve ser exibido para sucesso e erro
        nas ações de decisão

RNF08 — O layout deve ser responsivo: 1 coluna em mobile,
        2 colunas em tablet e 3 colunas em desktop

RNF09 — O tema deve ser claro, com design profissional e limpo

---

### Qualidade e Robustez

RNF10 — O TypeScript não deve apresentar erros de compilação em
        frontend e backend. O comando exato de verificação a ser executado
        tanto na pasta `frontend/` quanto na pasta `backend/` é:
        `npx tsc --noEmit`
        Este comando deve passar sem erros (código de saída 0) como gate
        obrigatório de conclusão em cada camada.

RNF11 — Erros devem retornar respostas HTTP adequadas:
        400 para entrada inválida, 404 para recurso não encontrado,
        422 para arquivo inválido e 500 para erros inesperados

RNF12 — Todos os erros da API devem seguir o formato:
        { "error": "mensagem descritiva" }

---

### Banco de Dados

RNF13 — Os campos situacao, estado, dataPrazo, atualizadaEm e
        valorEstimado devem ter índices declarados no schema Prisma

RNF14 — As migrations devem ser executadas a partir de database/
        com npx prisma migrate dev

---

### Documentação

RNF15 — O README deve conter instruções completas de setup do banco,
        execução das migrations e inicialização de frontend e backend