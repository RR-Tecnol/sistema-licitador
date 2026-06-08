import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLicitacoes,
  getLicitacaoById,
  saveInteresse,
  removeInteresse,
  importExcel,
  type GetLicitacoesParams,
} from '../services/licitacoes'
import type { Decisao } from '../types'

export function useLicitacoes(filters: GetLicitacoesParams) {
  return useQuery({
    queryKey: [
      'licitacoes',
      filters.decisao || 'todas',
      filters.page,
      filters.situacao,
      filters.estado,
      filters.q,
      filters.ordenar,
    ],
    queryFn: () => getLicitacoes(filters),
    placeholderData: (previousData) => previousData,
  })
}

export function useLicitacaoDetails(id: string) {
  return useQuery({
    queryKey: ['licitacao', id],
    queryFn: () => getLicitacaoById(id),
    enabled: !!id,
  })
}

export function useImportLicitacoes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['interesses'] })
    },
  })
}

export function useSaveInteresse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, decisao }: { id: string; decisao: Decisao }) => saveInteresse(id, decisao),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['licitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['interesses'] })
      queryClient.invalidateQueries({ queryKey: ['licitacao', variables.id] })
    },
  })
}

export function useDeleteInteresse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeInteresse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['licitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['interesses'] })
      queryClient.invalidateQueries({ queryKey: ['licitacao', id] })
    },
  })
}
