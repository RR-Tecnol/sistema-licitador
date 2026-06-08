import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err)
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
    res.status(400).json({ error: `Dados inválidos: ${messages}` })
    return
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    res.status(400).json({ error: `Erro no upload do arquivo: ${err.message}` })
    return
  }

  // Prisma Errors
  // Check if it's a Prisma error (P2025 is Record Not Found)
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const code = (err as any).code
    if (code === 'P2025') {
      res.status(404).json({ error: 'Recurso não encontrado' })
      return
    }
  }

  // Unexpected errors
  console.error('Erro inesperado:', err)
  res.status(500).json({ error: err.message || 'Erro inesperado no servidor' })
}
