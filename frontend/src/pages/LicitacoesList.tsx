import { useState, useEffect } from 'react'
import { useLicitacoes } from '../hooks/useLicitacoes'
import { SituacaoLicitacao } from '../types'
import LicitacaoCard from '../components/LicitacaoCard'
import LicitacaoDetailModal from '../components/LicitacaoDetailModal'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

type TabType = 'todas' | 'participando' | 'declinado'

interface TabState {
  page: number
  situacao: string
  estado: string
  q: string
  ordenar: string
}

const INITIAL_TAB_STATE: TabState = {
  page: 1,
  situacao: '',
  estado: '',
  q: '',
  ordenar: 'dataPrazo',
}

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function LicitacoesList() {
  const [activeTab, setActiveTab] = useState<TabType>('todas')
  const [tabStates, setTabStates] = useState<Record<TabType, TabState>>({
    todas: { ...INITIAL_TAB_STATE },
    participando: { ...INITIAL_TAB_STATE },
    declinado: { ...INITIAL_TAB_STATE },
  })

  // Local search text state to handle input changes immediately
  const [localSearch, setLocalSearch] = useState('')
  const [selectedLicitacaoId, setSelectedLicitacaoId] = useState<string | null>(null)

  // Get current active tab state
  const currentTabState = tabStates[activeTab]

  // Update local input search text when changing tabs
  useEffect(() => {
    setLocalSearch(currentTabState.q)
  }, [activeTab])

  // Debounce search text updates (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setTabStates((prev) => {
        if (prev[activeTab].q === localSearch) return prev
        return {
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            q: localSearch,
            page: 1, // Reset page when query changes
          },
        }
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, activeTab])

  // Fetch data with TanStack Query custom hook
  const { data, isLoading, isPlaceholderData } = useLicitacoes({
    page: currentTabState.page,
    limit: 10,
    situacao: currentTabState.situacao || undefined,
    estado: currentTabState.estado || undefined,
    q: currentTabState.q || undefined,
    decisao: activeTab !== 'todas' ? activeTab : undefined,
    ordenar: currentTabState.ordenar,
  })

  const updateTabState = (updater: Partial<TabState>) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        ...updater,
      },
    }))
  }

  // Handle filter changes (resets page to 1)
  const handleFilterChange = (field: keyof TabState, value: string) => {
    updateTabState({ [field]: value, page: 1 })
  }

  // Check if any filter is active
  const hasActiveFilters = currentTabState.situacao !== '' || currentTabState.estado !== '' || currentTabState.q !== ''

  const clearFilters = () => {
    setLocalSearch('')
    updateTabState({
      situacao: '',
      estado: '',
      q: '',
      page: 1,
    })
  }

  // Skeleton loading markup
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-150 rounded w-full"></div>
          <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
            <div className="h-8 bg-gray-200 rounded col-span-1"></div>
            <div className="h-8 bg-gray-200 rounded col-span-1"></div>
            <div className="h-8 bg-gray-200 rounded col-span-1"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex border-b border-gray-200">
        {(['todas', 'participando', 'declinado'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab === 'todas' ? 'Todas' : tab === 'participando' ? 'Participando' : 'Declinadas'}
          </button>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por objeto ou órgão..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Filter Selects & Order */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Situation Filter */}
          <div className="flex items-center space-x-1.5">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={currentTabState.situacao}
              onChange={(e) => handleFilterChange('situacao', e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Todas Situações</option>
              {Object.values(SituacaoLicitacao).map((sit) => (
                <option key={sit} value={sit}>
                  {sit}
                </option>
              ))}
            </select>
          </div>

          {/* UF Filter */}
          <select
            value={currentTabState.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Todos Estados</option>
            {BRAZIL_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Order Selector */}
          <select
            value={currentTabState.ordenar}
            onChange={(e) => updateTabState({ ordenar: e.target.value, page: 1 })}
            className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="dataPrazo">Ordenar por Prazo (ASC)</option>
            <option value="valorEstimado">Ordenar por Valor (DESC)</option>
            <option value="atualizadaEm">Ordenar por Atualização (DESC)</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 py-2 px-3 hover:bg-red-50 rounded-xl transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        renderSkeletons()
      ) : !data || data.data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="bg-gray-100 p-4 rounded-full text-gray-400 mb-4">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Nenhuma licitação encontrada</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {hasActiveFilters
              ? 'Tente remover alguns filtros ou alterar o termo de busca para localizar registros.'
              : 'Importe uma planilha consolidada na seção correspondente para carregar licitações.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 px-4 rounded-xl transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
            isPlaceholderData ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {data.data.map((licitacao) => (
            <LicitacaoCard
              key={licitacao.id}
              licitacao={licitacao}
              onViewDetails={(id) => setSelectedLicitacaoId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-gray-500 font-semibold">
            Página {data.page} de {data.totalPages} ({data.total} itens encontrados)
          </span>

          <div className="flex space-x-2">
            <button
              disabled={data.page === 1}
              onClick={() => updateTabState({ page: data.page - 1 })}
              className="p-2 border border-gray-200 rounded-xl text-gray-650 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={data.page === data.totalPages}
              onClick={() => updateTabState({ page: data.page + 1 })}
              className="p-2 border border-gray-200 rounded-xl text-gray-650 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLicitacaoId && (
        <LicitacaoDetailModal id={selectedLicitacaoId} onClose={() => setSelectedLicitacaoId(null)} />
      )}
    </div>
  )
}
