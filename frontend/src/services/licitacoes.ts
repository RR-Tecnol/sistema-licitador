import api from './api'
import type { Licitacao, PaginatedResponse, Interesse, Decisao, ImportResponse } from '../types'

export interface GetLicitacoesParams {
  situacao?: string
  estado?: string
  q?: string
  decisao?: string
  ordenar?: string
  page?: number
  limit?: number
}

export async function getLicitacoes(params: GetLicitacoesParams) {
  const response = await api.get<PaginatedResponse<Licitacao>>('/api/licitacoes', { params })
  return response.data
}

export async function getLicitacaoById(id: string) {
  const response = await api.get<Licitacao>(`/api/licitacoes/${id}`)
  return response.data
}

export async function getAllInteresses() {
  const response = await api.get<Interesse[]>('/api/interesses')
  return response.data
}

export async function saveInteresse(licitacaoId: string, decisao: Decisao) {
  const response = await api.post<Interesse>('/api/interesses', { licitacaoId, decisao })
  return response.data
}

export async function removeInteresse(licitacaoId: string) {
  const response = await api.delete<{ success: boolean }>(`/api/interesses/${licitacaoId}`)
  return response.data
}

export async function importExcel(file: File) {
  const formData = new FormData()
  formData.append('arquivo', file)

  const response = await api.post<ImportResponse>('/api/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
