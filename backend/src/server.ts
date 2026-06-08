import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import importRouter from './routes/import'
import licitacoesRouter from './routes/licitacoes'
import interessesRouter from './routes/interesses'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const port = process.env.PORT || 3333

// Set up CORS - allow frontend origin
const frontendUrl = process.env.CORS_ORIGIN
if (!frontendUrl) {
  throw new Error('A variável de ambiente CORS_ORIGIN não está configurada no backend.')
}
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
)

// Parse JSON request bodies
app.use(express.json())

// Mount routes
app.use('/api/import', importRouter)
app.use('/api/licitacoes', licitacoesRouter)
app.use('/api/interesses', interessesRouter)

// Global error handler
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`)
  console.log(`CORS habilitado para a origem: ${frontendUrl}`)
})
