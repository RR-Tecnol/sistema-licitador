import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { getAllInteresses, upsertInteresse, deleteInteresse } from '../services/interessesService'
import { Decisao } from 'database'

const router = Router()

const interesseSchema = z.object({
  licitacaoId: z.string().min(1),
  decisao: z.nativeEnum(Decisao),
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interesses = await getAllInteresses()
    res.json(interesses)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { licitacaoId, decisao } = interesseSchema.parse(req.body)
    const result = await upsertInteresse(licitacaoId, decisao)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.delete('/:licitacaoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { licitacaoId } = req.params
    await deleteInteresse(licitacaoId as string)
    res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router
