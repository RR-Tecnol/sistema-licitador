import prisma from '../lib/prisma'
import { Decisao } from 'database'
import { AppError } from '../middleware/errorHandler'

export async function getAllInteresses() {
  return prisma.interesse.findMany({
    include: {
      licitacao: true,
    },
  })
}

export async function upsertInteresse(licitacaoId: string, decisao: Decisao) {
  // Validate that Licitacao exists
  const licitacao = await prisma.licitacao.findUnique({
    where: { id: licitacaoId },
  })

  if (!licitacao) {
    throw new AppError(404, 'Licitação correspondente não encontrada')
  }

  return prisma.interesse.upsert({
    where: { licitacaoId },
    update: {
      decisao,
      marcadoEm: new Date(),
    },
    create: {
      licitacaoId,
      decisao,
      marcadoEm: new Date(),
    },
  })
}

export async function deleteInteresse(licitacaoId: string) {
  // Check if it exists
  const existing = await prisma.interesse.findUnique({
    where: { licitacaoId },
  })

  if (!existing) {
    throw new AppError(404, 'Decisão de interesse não encontrada')
  }

  return prisma.interesse.delete({
    where: { licitacaoId },
  })
}
