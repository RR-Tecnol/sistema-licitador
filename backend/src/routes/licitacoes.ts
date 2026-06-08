import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { getLicitacoes, getLicitacaoById } from '../services/licitacoesService'
import { SituacaoLicitacao } from '../types'
import { AppError } from '../middleware/errorHandler'

const router = Router()

const querySchema = z.object({
  situacao: z.nativeEnum(SituacaoLicitacao).optional(),
  estado: z.string().length(2).optional(),
  q: z.string().optional(),
  decisao: z.enum(['participando', 'declinado']).optional(),
  ordenar: z.enum(['dataPrazo', 'valorEstimado', 'atualizadaEm']).optional(),
  page: z.preprocess((val) => Number(val) || 1, z.number().int().min(1)).optional(),
  limit: z.preprocess((val) => Number(val) || 10, z.number().int().min(1)).optional(),
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = querySchema.parse(req.query)
    const result = await getLicitacoes(filters)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const licitacao = await getLicitacaoById(id as string)

    if (!licitacao) {
      throw new AppError(404, 'Licitação não encontrada')
    }

    res.json(licitacao)
  } catch (error) {
    next(error)
  }
})

export default router
