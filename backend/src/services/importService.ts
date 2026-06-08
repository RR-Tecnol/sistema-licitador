import * as xlsx from 'xlsx'
import prisma from '../lib/prisma'
import { SituacaoLicitacao } from '../types'
import { AppError } from '../middleware/errorHandler'

function normalizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '')
}

function parseExcelDate(val: any): Date | null {
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val
  }
  if (typeof val === 'number') {
    return new Date(Math.round((val - 25569) * 86400 * 1000))
  }
  if (typeof val === 'string') {
    const clean = val.trim().toLowerCase()
    if (clean === '' || clean === 'nao informado' || clean === 'não informado') {
      return null
    }
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

export async function importExcelFile(fileBuffer: Buffer) {
  let importados = 0
  let atualizados = 0
  let ignorados = 0

  // Read the workbook from buffer
  const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true })

  // 1. Process "Licitações" Sheet
  const licitacoesSheet = workbook.Sheets['Licitações']
  const acompanhamentosSheet = workbook.Sheets['Acompanhamentos']
  if (!licitacoesSheet) {
    throw new AppError(422, 'Aba "Licitações" não encontrada no arquivo Excel')
  }
  if (!acompanhamentosSheet) {
    throw new AppError(422, 'Aba "Acompanhamentos" não encontrada no arquivo Excel')
  }

  const rawLicitacoes = xlsx.utils.sheet_to_json(licitacoesSheet, { defval: null })
  const mappedLicitacoes = rawLicitacoes.map((row: any) => {
    const normalizedRow: any = {}
    for (const key of Object.keys(row)) {
      normalizedRow[normalizeKey(key)] = row[key]
    }
    return normalizedRow
  })

  // Set of valid SituacaoLicitacao values
  const validSituacoes = Object.values(SituacaoLicitacao)

  for (const row of mappedLicitacoes) {
    if (!row.numeroconlicitacao) {
      continue // Skip rows without id
    }

    const id = String(row.numeroconlicitacao)
    const codigo = row.codigo ? String(row.codigo) : null
    const orgao = row.orgao ? String(row.orgao) : 'Órgão não informado'
    const endereco = row.endereco ? String(row.endereco) : null
    const cidade = row.cidade ? String(row.cidade) : 'Cidade não informada'
    const estado = row.estado ? String(row.estado).substring(0, 2).toUpperCase() : 'UF'
    const cep = row.cep ? String(row.cep) : null
    const edital = row.edital ? String(row.edital) : 'Edital não informado'
    const processo = row.processo ? String(row.processo) : null

    // Parse valorEstimado
    let valorEstimado = null
    if (row.valorestimado !== null && row.valorestimado !== undefined) {
      const valStr = String(row.valorestimado).replace(/[^0-9.-]/g, '')
      const parsedVal = parseFloat(valStr)
      if (!isNaN(parsedVal)) {
        valorEstimado = parsedVal
      }
    }

    const itens = row.itens ? String(row.itens) : null

    // Determine and validate situacao enum value
    let situacao: SituacaoLicitacao | null = null
    if (row.situacao) {
      const rawSituacao = String(row.situacao).trim().toUpperCase()
      if (validSituacoes.includes(rawSituacao as any)) {
        situacao = rawSituacao as SituacaoLicitacao
      }
    }

    if (!situacao) {
      ignorados++
      continue
    }

    const dataDocumento = parseExcelDate(row.documento)
    const dataAbertura = parseExcelDate(row.abertura)
    const dataPrazo = parseExcelDate(row.prazo)
    const objeto = row.objeto ? String(row.objeto) : 'Objeto não informado'
    const observacao = row.observacao ? String(row.observacao) : null
    const editalUrl = row.anexos ? String(row.anexos) : null
    const atualizadaEm = parseExcelDate(row.atualizadaem) || new Date()

    const upsertData = {
      codigo,
      orgao,
      endereco,
      cidade,
      estado,
      cep,
      edital,
      processo,
      valorEstimado,
      itens,
      situacao,
      dataDocumento,
      dataAbertura,
      dataPrazo,
      objeto,
      observacao,
      editalUrl,
      atualizadaEm,
    }

    const existing = await prisma.licitacao.findUnique({ where: { id } })
    if (existing) {
      await prisma.licitacao.update({
        where: { id },
        data: upsertData,
      })
      atualizados++
    } else {
      await prisma.licitacao.create({
        data: {
          id,
          ...upsertData,
        },
      })
      importados++
    }
  }

  // 2. Fetch all valid Licitacao IDs currently in DB
  const dbLicitacoes = await prisma.licitacao.findMany({
    select: { id: true },
  })
  const existingLicitacaoIds = new Set(dbLicitacoes.map((l) => l.id))

  // 3. Process "Acompanhamentos" Sheet
  if (acompanhamentosSheet) {
    const rawAcompanhamentos = xlsx.utils.sheet_to_json(acompanhamentosSheet, { defval: null })
    const mappedAcompanhamentos = rawAcompanhamentos.map((row: any) => {
      const normalizedRow: any = {}
      for (const key of Object.keys(row)) {
        normalizedRow[normalizeKey(key)] = row[key]
      }
      return normalizedRow
    })

    for (const row of mappedAcompanhamentos) {
      if (!row.numeroconlicitacao) {
        continue // Skip empty rows
      }

      const id = String(row.numeroconlicitacao)
      const licitacaoId = row.licitacaoreferente ? String(row.licitacaoreferente) : null

      // Rule: Ignore orphan acompanhamentos silently
      if (!licitacaoId || !existingLicitacaoIds.has(licitacaoId)) {
        ignorados++
        continue
      }

      const orgao = row.orgao ? String(row.orgao) : 'Órgão não informado'
      const cidade = row.cidade ? String(row.cidade) : 'Cidade não informada'
      const estado = row.estado ? String(row.estado).substring(0, 2).toUpperCase() : 'UF'
      const edital = row.edital ? String(row.edital) : 'Edital não informado'
      const processo = row.processo ? String(row.processo) : null
      const dataFonte = parseExcelDate(row.datafonte) || new Date()
      const objeto = row.objeto ? String(row.objeto) : 'Objeto não informado'
      const sintese = row.sintese ? String(row.sintese) : 'Síntese não informada'

      const upsertData = {
        licitacaoId,
        orgao,
        cidade,
        estado,
        edital,
        processo,
        dataFonte,
        objeto,
        sintese,
      }

      const existing = await prisma.acompanhamento.findUnique({ where: { id } })
      if (existing) {
        await prisma.acompanhamento.update({
          where: { id },
          data: upsertData,
        })
        atualizados++
      } else {
        await prisma.acompanhamento.create({
          data: {
            id,
            ...upsertData,
          },
        })
        importados++
      }
    }
  }

  return {
    importados,
    atualizados,
    ignorados,
  }
}
