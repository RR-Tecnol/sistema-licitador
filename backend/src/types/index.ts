export enum SituacaoLicitacao {
  URGENTE    = 'URGENTE',
  NOVA       = 'NOVA',
  ADIADA     = 'ADIADA',
  PRORROGADA = 'PRORROGADA',
  ALTERADA   = 'ALTERADA',
  REVOGADA   = 'REVOGADA',
  EDITAL     = 'EDITAL',
}

export type Decisao = 'participando' | 'declinado';

export interface Licitacao {
  id:            string;
  codigo:        string | null;
  orgao:         string;
  endereco:      string | null;
  cidade:        string;
  estado:        string;
  cep:           string | null;
  edital:        string;
  processo:      string | null;
  valorEstimado: string | null;  // Decimal is serialized as string
  itens:         string | null;
  situacao:      SituacaoLicitacao;
  dataDocumento: string | null;  // ISO 8601
  dataAbertura:  string | null;  // ISO 8601
  dataPrazo:     string | null;  // ISO 8601
  objeto:        string;
  observacao:    string | null;
  editalUrl:     string | null;
  atualizadaEm:  string;         // ISO 8601

  interesse?:       Interesse | null;
  acompanhamentos?: Acompanhamento[];
}

export interface Acompanhamento {
  id:          string;
  licitacaoId: string;
  orgao:       string;
  cidade:      string;
  estado:      string;
  edital:      string;
  processo:    string | null;
  dataFonte:   string;           // ISO 8601;
  objeto:      string;
  sintese:     string;
}

export interface Interesse {
  licitacaoId: string;
  marcadoEm:   string;           // ISO 8601;
  decisao:     Decisao;
  licitacao?:  Licitacao;
}

export interface PaginatedResponse<T> {
  data:        T[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
}

export interface ImportResponse {
  importados:  number;
  atualizados: number;
  ignorados:   number;
}

export interface ErrorResponse {
  error: string;
}
