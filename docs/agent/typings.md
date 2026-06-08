## Tipos Compartilhados

Este arquivo define as interfaces e enums que representam os dados
trafegados entre frontend e backend via API. Os tipos aqui refletem
a estrutura JSON das respostas — não os tipos internos do Prisma.

---

## Enums

// Espelha o enum SituacaoLicitacao definido no schema Prisma.
// O frontend deve usar este enum para comparações e exibição.
enum SituacaoLicitacao {
  URGENTE    = 'URGENTE',
  NOVA       = 'NOVA',
  ADIADA     = 'ADIADA',
  PRORROGADA = 'PRORROGADA',
  ALTERADA   = 'ALTERADA',
  REVOGADA   = 'REVOGADA',
  EDITAL     = 'EDITAL',
}

// Espelha o enum Decisao definido no schema Prisma.
type Decisao = 'participando' | 'declinado'

---

## Entidades

interface Licitacao {
  id:            string
  codigo:        string | null
  orgao:         string
  endereco:      string | null
  cidade:        string
  estado:        string
  cep:           string | null
  edital:        string
  processo:      string | null
  valorEstimado: string | null  // Decimal do Prisma é serializado como
                                // string no JSON — ex: "928681.01"
                                // Converter para número apenas na exibição
  itens:         string | null
  situacao:      SituacaoLicitacao
  dataDocumento: string | null  // ISO 8601
  dataAbertura:  string | null  // ISO 8601
  dataPrazo:     string | null  // ISO 8601
  objeto:        string
  observacao:    string | null
  editalUrl:     string | null
  atualizadaEm:  string         // ISO 8601

  // Presente no GET /api/licitacoes e no GET /api/licitacoes/:id
  interesse?:       Interesse | null

  // Presente apenas no GET /api/licitacoes/:id
  acompanhamentos?: Acompanhamento[]
}

interface Acompanhamento {
  id:          string
  licitacaoId: string
  orgao:       string
  cidade:      string
  estado:      string
  edital:      string
  processo:    string | null
  dataFonte:   string           // ISO 8601
  objeto:      string
  sintese:     string
}

interface Interesse {
  licitacaoId: string
  marcadoEm:   string           // ISO 8601
  decisao:     Decisao
  licitacao?:  Licitacao        // Presente apenas no GET /api/interesses
}

---

## Tipos de Resposta da API

interface PaginatedResponse<T> {
  data:        T[]
  total:       number    // total de registros sem paginação
  page:        number    // página atual
  limit:       number    // itens por página
  totalPages:  number    // total de páginas
}

interface ImportResponse {
  importados:  number
  atualizados: number
  ignorados:   number
}

interface ErrorResponse {
  error: string
}