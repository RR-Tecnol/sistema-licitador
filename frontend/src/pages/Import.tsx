import React, { useState, useRef } from 'react'
import { useImportLicitacoes } from '../hooks/useLicitacoes'
import { FileSpreadsheet, UploadCloud, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImportCounters {
  importados: number
  atualizados: number
  ignorados: number
}

export default function Import() {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [result, setResult] = useState<ImportCounters | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mutation = useImportLicitacoes()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile)
        setResult(null)
      } else {
        toast.error('Apenas arquivos no formato .xlsx são aceitos.')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setResult(null)
      } else {
        toast.error('Apenas arquivos no formato .xlsx são aceitos.')
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = () => {
    if (file) {
      mutation.mutate(file, {
        onSuccess: (data) => {
          setResult(data)
          setFile(null)
          toast.success('Planilha importada com sucesso!')
        },
        onError: (err: any) => {
          const errorMsg = err.response?.data?.error || err.message || 'Erro ao importar arquivo'
          toast.error(errorMsg)
        },
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Importar Licitações</h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecione ou arraste a planilha consolidada (.xlsx) para cadastrar ou atualizar licitações e acompanhamentos.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={mutation.isPending ? undefined : triggerFileInput}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-gray-300 hover:border-indigo-400 bg-white hover:bg-gray-50/50'
        } ${mutation.isPending ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
          disabled={mutation.isPending}
        />

        <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4 transition-transform duration-300 group-hover:scale-110">
          <UploadCloud className="h-8 w-8" />
        </div>

        <p className="text-base font-semibold text-gray-700">
          {file ? file.name : 'Arraste a planilha aqui ou clique para buscar'}
        </p>
        <p className="text-xs text-gray-400 mt-2 font-medium">Aceita apenas arquivos formato .xlsx</p>
      </div>

      {/* Upload Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-150 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {mutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Processando planilha...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              <span>Enviar Planilha</span>
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {mutation.isError && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Falha no Processamento</h4>
            <p className="text-xs mt-1 text-red-700 leading-relaxed">
              {mutation.error instanceof Error ? mutation.error.message : 'Ocorreu um erro ao processar o arquivo.'}
            </p>
          </div>
        </div>
      )}

      {/* Success Counters */}
      {result && (
        <div className="space-y-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
            <CheckCircle className="h-5 w-5" />
            <span>Processamento finalizado com sucesso!</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Created */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-emerald-600">{result.importados}</span>
              <p className="text-xs font-bold text-gray-500 mt-2">Importados</p>
              <p className="text-[10px] text-gray-400 mt-1">Novos registros criados no banco</p>
            </div>

            {/* Updated */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-indigo-600">{result.atualizados}</span>
              <p className="text-xs font-bold text-gray-500 mt-2">Atualizados</p>
              <p className="text-[10px] text-gray-400 mt-1">Registros existentes atualizados</p>
            </div>

            {/* Ignored */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-amber-600">{result.ignorados}</span>
              <p className="text-xs font-bold text-gray-500 mt-2">Ignorados</p>
              <p className="text-[10px] text-gray-400 mt-1">Acompanhamentos sem licitação correspondente</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
