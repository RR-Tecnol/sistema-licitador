import { useLicitacaoDetails } from '../hooks/useLicitacoes'
import { X, Calendar, ExternalLink, RefreshCw, Landmark } from 'lucide-react'

interface LicitacaoDetailModalProps {
  id: string
  onClose: () => void
}

export default function LicitacaoDetailModal({ id, onClose }: LicitacaoDetailModalProps) {
  const { data: licitacao, isLoading, error } = useLicitacaoDetails(id)

  // Format Helpers
  const formatBRL = (val: any) => {
    const num = parseFloat(String(val))
    return isNaN(num) ? String(val) : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
  }

  const formatDate = (val: any) => {
    const date = new Date(val)
    return isNaN(date.getTime()) ? String(val) : date.toLocaleDateString('pt-BR')
  }

  const formatDateTime = (val: any) => {
    const date = new Date(val)
    return isNaN(date.getTime()) ? String(val) : date.toLocaleString('pt-BR')
  }

  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || String(value).trim() === '' || String(value).trim().toLowerCase() === 'nao informado' || String(value).trim().toLowerCase() === 'não informado') {
      return null
    }
    const displayVal = formatter ? formatter(value) : String(value)
    return (
      <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl transition-all hover:bg-gray-100/50">
        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-gray-800 mt-1 block leading-relaxed whitespace-pre-wrap">
          {displayVal}
        </span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-700">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 line-clamp-1">
                {isLoading ? 'Carregando detalhes...' : licitacao?.orgao}
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                {isLoading ? 'Aguarde' : `Edital: ${licitacao?.edital}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="text-sm text-gray-500 font-medium">Buscando informações da licitação...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-600">
              <p className="font-semibold text-sm">Ocorreu um erro ao carregar os dados.</p>
              <p className="text-xs mt-1 text-red-500">{(error as any).message || 'Erro inesperado'}</p>
            </div>
          )}

          {licitacao && (
            <>
              {/* Decision Indicator Alert */}
              {licitacao.interesse && (
                <div
                  className={`p-4 rounded-xl flex items-center justify-between border ${
                    licitacao.interesse.decisao === 'participando'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="text-xs">
                    <span className="font-bold uppercase tracking-wider block">
                      Decisão: {licitacao.interesse.decisao === 'participando' ? 'Participando' : 'Declinado'}
                    </span>
                    <span className="text-gray-500 font-medium mt-1 block">
                      Marcado em: {formatDateTime(licitacao.interesse.marcadoEm)}
                    </span>
                  </div>
                </div>
              )}

              {/* General Grid Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('Código', licitacao.codigo)}
                  {renderField('Processo', licitacao.processo)}
                  {renderField('Órgão', licitacao.orgao)}
                  {renderField('Endereço', licitacao.endereco)}
                  {renderField('Cidade', licitacao.cidade)}
                  {renderField('Estado', licitacao.estado)}
                  {renderField('CEP', licitacao.cep)}
                  {renderField('Situação', licitacao.situacao)}
                  {renderField('Valor Estimado', licitacao.valorEstimado, formatBRL)}
                  {renderField('Data do Documento', licitacao.dataDocumento, formatDate)}
                  {renderField('Data de Abertura', licitacao.dataAbertura, formatDate)}
                  {renderField('Prazo limite', licitacao.dataPrazo, formatDate)}
                  {renderField('Última Atualização', licitacao.atualizadaEm, formatDateTime)}
                </div>
              </div>

              {/* Objeto */}
              {licitacao.objeto && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                    Objeto
                  </h3>
                  <div className="bg-gray-50 border border-gray-150 p-5 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {licitacao.objeto}
                  </div>
                </div>
              )}

              {/* Itens */}
              {licitacao.itens && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                    Itens da Licitação
                  </h3>
                  <div className="bg-gray-50 border border-gray-150 p-5 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium max-h-60 overflow-y-auto">
                    {licitacao.itens}
                  </div>
                </div>
              )}

              {/* Observação */}
              {licitacao.observacao && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                    Observações Internas
                  </h3>
                  <div className="bg-gray-50 border border-gray-150 p-5 rounded-xl text-sm text-gray-750 leading-relaxed whitespace-pre-wrap font-medium">
                    {licitacao.observacao}
                  </div>
                </div>
              )}

              {/* Timeline (Acompanhamentos) */}
              {licitacao.acompanhamentos && licitacao.acompanhamentos.length > 0 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                    Histórico de Acompanhamentos
                  </h3>
                  
                  <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6 ml-3">
                    {licitacao.acompanhamentos.map((acomp) => (
                      <div key={acomp.id} className="relative group">
                        {/* Circle Indicator on vertical line */}
                        <div className="absolute -left-[31px] top-1 bg-white border-4 border-indigo-500 rounded-full h-4.5 w-4.5" />
                        
                        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start flex-wrap gap-2 text-xs mb-3 text-gray-400 font-bold">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Fonte: {formatDate(acomp.dataFonte)}</span>
                            </span>
                            <span>Acompanhamento: {acomp.id}</span>
                          </div>

                          <h4 className="text-xs font-bold text-gray-800 leading-normal mb-2">
                            {acomp.edital} - {acomp.orgao}
                          </h4>

                          <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed whitespace-pre-wrap">
                            {acomp.sintese}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-250 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors"
          >
            Fechar
          </button>
          
          {licitacao?.editalUrl && (
            <a
              href={licitacao.editalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 hover:scale-[1.01]"
            >
              <span>Abrir Edital</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

      </div>
    </div>
  )
}
