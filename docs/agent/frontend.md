## Especificações do Frontend

O frontend deve obedecer à stack tecnológica definida em geral.md,
além das especificações definidas nesta seção.

---

## Camada de Serviços

### Instância do Axios

Todas as chamadas HTTP devem ser feitas via axios, centralizado em
um único arquivo services/api.ts que configura a instância base:

       import axios from 'axios'

       const api = axios.create({
         baseURL: import.meta.env.VITE_API_URL,
       })

       export default api

Todos os outros arquivos de services/ devem importar essa instância
e nunca instanciar axios diretamente ou referenciar URLs absolutas.

---

### Utilização de Hooks

Toda a lógica de requisições HTTP deve ser encapsulada em hooks customizados em frontend/src/hooks/
que usem a biblioteca TanStack Query.

- Evite usar useQuery e useMutation diretamente nos componentes;
- Crie hooks específicos para cada endpoint que agrupem lógica de query, invalidação
  e tratamento de erros;
- Use mutateAsync quando precisar encadear múltiplas requisições ou realizar ações
  pós-sucesso.

---

## Páginas

### Listagem de Licitações (rota principal)

#### Tabs
- Tabs rápidas no topo: "Todas" | "Participando" | "Declinadas"
- "Todas" → GET /api/licitacoes (sem filtro de decisão)
- "Participando" → GET /api/licitacoes?decisao=participando
- "Declinadas" → GET /api/licitacoes?decisao=declinado
- Cada tab mantém filtros, ordenação e paginação próprios e
  independentes entre si

#### Cards
- Cada card exibe: número do edital, órgão, cidade/estado, objeto
  truncado em 2 linhas, badge de situação, valor estimado formatado
  em BRL e dataPrazo
- Clicar no card abre o modal de detalhe da licitação
- Card com decisão registrada exibe borda colorida e ícone de status:
  verde para "participando", vermelho para "declinado"

#### Badge de Situação
Cada valor do enum SituacaoLicitacao deve ter cor distinta:

- URGENTE    → vermelho
- NOVA       → azul
- PRORROGADA → laranja
- ALTERADA   → roxo
- EDITAL     → verde
- ADIADA     → amarelo
- REVOGADA   → cinza

#### Badge de Urgência
Exibido quando: situacao === URGENTE ou dataPrazo nos próximos 3 dias.
O cálculo deve ser feito em relação à data atual no momento da
renderização, não em tempo de build.

#### Filtros e Busca
- Filtros: situacao (enum), estado (UF)
- Busca textual em objeto e orgao com debounce de 300ms
- Ordenação: dataPrazo (padrão), valorEstimado, atualizadaEm

#### Paginação
- 10 itens por página
- Controles de navegação baseados nos metadados retornados pela API
  (total, page, limit, totalPages)

---

### Decisão de Participação

- Cada card tem dois botões: "Participar" e "Declinar"
- Clicar em "Participar" chama POST /api/interesses com
  decisao: "participando"
- Clicar em "Declinar" chama POST /api/interesses com
  decisao: "declinado"
- Clicar no botão correspondente à decisão já registrada chama
  DELETE /api/interesses/:licitacaoId, removendo a decisão
- Após POST ou DELETE, invalidar as query keys ['licitacoes']
  e ['interesses'] no TanStack Query

---

### Modal de Detalhe da Licitação

- Exibe todos os campos da Licitacao que possuem valor
- Campos opcionais nulos são omitidos — não exibir "Não informado"
- Seção de Acompanhamentos exibe timeline ordenada por dataFonte ASC
- Botão "Abrir Edital" abre editalUrl em nova aba; deve ser ocultado
  quando editalUrl for nulo
- Exibe data e hora em que a decisão foi registrada (marcadoEm),
  caso exista interesse vinculado

---

### Importação de Excel

- Página dedicada acessível via navegação
- Campo de upload que aceita exclusivamente arquivos .xlsx
- Botão de envio dispara POST /api/import via multipart/form-data
- Durante o envio, exibir estado de carregamento e bloquear
  novo envio até a resposta chegar
- Em caso de sucesso, exibir os contadores retornados pela API:
  importados, atualizados e ignorados
- Em caso de erro, exibir a mensagem retornada pela API

---

## UX

- Skeleton loading nos cards durante carregamento
- Feedback de toast para sucesso e erro nas ações de decisão
- Layout responsivo: 1 coluna (mobile) / 2 (tablet) / 3 (desktop)
- Tema claro, design profissional e limpo