import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { importExcelFile } from '../services/importService'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only accept .xlsx files
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx')
    ) {
      cb(null, true)
    } else {
      cb(new AppError(422, 'Formato inválido. O arquivo deve ser do tipo .xlsx'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

router.post(
  '/',
  upload.single('arquivo'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'Arquivo não enviado. Campo "arquivo" é obrigatório.')
      }

      const result = await importExcelFile(req.file.buffer)

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
)

export default router
