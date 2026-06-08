import prisma from '../lib/prisma'
import { SituacaoLicitacao, Decisao } from '../types'

interface GetLicitacoesFilters {
  situacao?: SituacaoLicitacao
  estado?: string
  q?: string
  decisao?: Decisao
  ordenar?: 'dataPrazo' | 'valorEstimado' | 'atualizadaEm'
  page?: number
  limit?: number
}

export async function getLicitacoes(filters: GetLicitacoesFilters) {
  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const where: any = {}

  if (filters.situacao) {
    where.situacao = filters.situacao
  }

  if (filters.estado) {
    where.estado = filters.estado.toUpperCase()
  }

  if (filters.q) {
    where.OR = [
      { objeto: { contains: filters.q } },
      { orgao: { contains: filters.q } },
    ]
  }

  if (filters.decisao) {
    where.interesse = {
      decisao: filters.decisao,
    }
  }

  // Build sorting object
  let orderBy: any = {}
  if (filters.ordenar === 'valorEstimado') {
    orderBy = {
      valorEstimado: {
        sort: 'desc',
        nulls: 'last',
      },
    }
  } else if (filters.ordenar === 'atualizadaEm') {
    orderBy = {
      atualizadaEm: {
        sort: 'desc',
        nulls: 'last',
      },
    }
  } else {
    // Default: dataPrazo ASC nulls last
    orderBy = {
      dataPrazo: {
        sort: 'asc',
        nulls: 'last',
      },
    }
  }

  // Get total count
  const total = await prisma.licitacao.count({ where })

  // Get paginated data
  const data = await prisma.licitacao.findMany({
    where,
    include: {
      interesse: true,
    },
    orderBy,
    skip,
    take: limit,
  })

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getLicitacaoById(id: string) {
  const licitacao = await prisma.licitacao.findUnique({
    where: { id },
    include: {
      interesse: true,
      acompanhamentos: {
        orderBy: {
          dataFonte: 'asc',
        },
      },
    },
  })

  return licitacao
}
