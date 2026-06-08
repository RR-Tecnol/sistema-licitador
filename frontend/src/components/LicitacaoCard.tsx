import { SituacaoLicitacao } from '../types'
import type { Licitacao, Decisao } from '../types'
import { Calendar, CircleDollarSign, Check, X, Flame, Eye } from 'lucide-react'
import { useSaveInteresse, useDeleteInteresse } from '../hooks/useLicitacoes'
import toast from 'react-hot-toast'

interface LicitacaoCardProps {
  licitacao: Licitacao
  onViewDetails: (id: string) => void
}

export default function LicitacaoCard({ licitacao, onViewDetails }: LicitacaoCardProps) {
  // Define situation colors
  const situationStyles: Record<SituacaoLicitacao, string> = {
    [SituacaoLicitacao.URGENTE]: 'bg-red-50 text-red-700 border-red-200',
    [SituacaoLicitacao.NOVA]: 'bg-blue-50 text-blue-700 border-blue-200',
    [SituacaoLicitacao.PRORROGADA]: 'bg-orange-50 text-orange-700 border-orange-200',
    [SituacaoLicitacao.ALTERADA]: 'bg-purple-50 text-purple-700 border-purple-200',
    [SituacaoLicitacao.EDITAL]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [SituacaoLicitacao.ADIADA]: 'bg-amber-50 text-amber-700 border-amber-200',
    [SituacaoLicitacao.REVOGADA]: 'bg-gray-100 text-gray-600 border-gray-300',
  }

  // Calculate if urgent (situacao === URGENTE or dataPrazo is within the next 3 days)
  const isUrgent = () => {
    if (licitacao.situacao === SituacaoLicitacao.URGENTE) return true
    if (licitacao.dataPrazo) {
      const prazoDate = new Date(licitacao.dataPrazo)
      const currentDate = new Date()
      // Zero out the hours to compare day differences only
      prazoDate.setHours(0, 0, 0, 0)
      currentDate.setHours(0, 0, 0, 0)
      const diffTime = prazoDate.getTime() - currentDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 3
    }
    return false
  }

  // Currency Formatter
  const formatBRL = (valStr: string | null) => {
    if (!valStr) return 'Não informado'
    const val = parseFloat(valStr)
    if (isNaN(val)) return 'Não informado'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  // Date Formatter
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Não informado'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Não informado'
    return date.toLocaleDateString('pt-BR')
  }

  const registeredDecision = licitacao.interesse?.decisao

  // Mutations using custom hooks
  const interestMutation = useSaveInteresse()
  const deleteMutation = useDeleteInteresse()

  const handleDecisionToggle = (targetDecision: Decisao) => {
    if (registeredDecision === targetDecision) {
      // If clicking the already selected decision, remove it
      deleteMutation.mutate(licitacao.id, {
        onSuccess: () => {
          toast.success('Decisão de interesse removida!')
        },
        onError: (err: any) => {
          const errorMsg = err.response?.data?.error || err.message || 'Erro ao remover decisão'
          toast.error(errorMsg)
        },
      })
    } else {
      // Set new or overwrite decision
      interestMutation.mutate(
        { id: licitacao.id, decisao: targetDecision },
        {
          onSuccess: (_, variables) => {
            const action = variables.decisao === 'participando' ? 'marcada para participação' : 'declinada'
            toast.success(`Licitação ${action} com sucesso!`)
          },
          onError: (err: any) => {
            const errorMsg = err.response?.data?.error || err.message || 'Erro ao registrar decisão'
            toast.error(errorMsg)
          },
        }
      )
    }
  }

  // Border and badge color for active decisions
  let cardBorders = 'border-gray-200'
  if (registeredDecision === 'participando') {
    cardBorders = 'border-emerald-500 ring-1 ring-emerald-500/20'
  } else if (registeredDecision === 'declinado') {
    cardBorders = 'border-red-500 ring-1 ring-red-500/20'
  }

  return (
    <div
      className={`relative bg-white border rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.005] transition-all flex flex-col justify-between overflow-hidden p-6 ${cardBorders}`}
    >
      {/* Top Banner Indicator for Decision */}
      {registeredDecision && (
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            registeredDecision === 'participando' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
      )}

      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-start space-x-2">
          {/* Edital Number & Badges */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-xs font-semibold text-gray-400">Edital: {licitacao.edital}</span>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  situationStyles[licitacao.situacao] || 'bg-gray-50 text-gray-500'
                }`}
              >
                {licitacao.situacao}
              </span>
              {isUrgent() && (
                <span className="flex items-center space-x-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  <Flame className="h-3 w-3 text-red-600 animate-pulse" />
                  <span>URGENTE</span>
                </span>
              )}
            </div>
          </div>

          {/* Action icon for registered decisions */}
          {registeredDecision && (
            <div
              className={`p-1.5 rounded-full border ${
                registeredDecision === 'participando'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              {registeredDecision === 'participando' ? (
                <Check className="h-4 w-4 stroke-[3]" />
              ) : (
                <X className="h-4 w-4 stroke-[3]" />
              )}
            </div>
          )}
        </div>

        {/* Órgão & Localização */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">
            {licitacao.orgao}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            {licitacao.cidade} / {licitacao.estado}
          </p>
        </div>

        {/* Objeto Truncado */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {licitacao.objeto}
        </p>
      </div>

      {/* Details & Action Buttons */}
      <div className="mt-5 pt-4 border-t border-gray-100 space-y-4">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Valor Estimado */}
          <div className="flex items-center space-x-2 text-gray-600">
            <CircleDollarSign className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] text-gray-400 font-bold uppercase leading-none">
                Valor
              </span>
              <span className="text-xs font-semibold text-gray-800 truncate block">
                {formatBRL(licitacao.valorEstimado)}
              </span>
            </div>
          </div>

          {/* Prazo */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] text-gray-400 font-bold uppercase leading-none">
                Prazo
              </span>
              <span className="text-xs font-semibold text-gray-800 truncate block">
                {formatDate(licitacao.dataPrazo)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* View Details Modal Button */}
          <button
            onClick={() => onViewDetails(licitacao.id)}
            className="flex items-center justify-center py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition-all"
            title="Visualizar Detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Participar Button */}
          <button
            onClick={() => handleDecisionToggle('participando')}
            disabled={interestMutation.isPending || deleteMutation.isPending}
            className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
              registeredDecision === 'participando'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/55'
            }`}
          >
            <span>Participar</span>
          </button>

          {/* Declinar Button */}
          <button
            onClick={() => handleDecisionToggle('declinado')}
            disabled={interestMutation.isPending || deleteMutation.isPending}
            className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
              registeredDecision === 'declinado'
                ? 'bg-red-600 border-red-600 text-white shadow-sm'
                : 'bg-white border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700 hover:bg-red-50/55'
            }`}
          >
            <span>Declinar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
