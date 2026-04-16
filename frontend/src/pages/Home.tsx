import { useCallback, useRef, useState } from 'react'
import JsonViewer from '../components/JsonViewer'
import api from '../utils/api'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface OcrResponse {
  success: boolean
  file?: {
    originalName: string
    mimeType: string
    size: number
  }
  documentType?: string | null
  language?: string | null
  fields?: Record<string, unknown>
  error?: string
  detail?: string
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.bmp'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<OcrResponse | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setStatus('idle')
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  const onSubmit = async () => {
    if (!file) return
    setStatus('loading')
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await api.post<OcrResponse>('/ocr/extract', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setStatus('success')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: OcrResponse } }
      setResult(axiosErr.response?.data ?? { success: false, error: 'Network error' })
      setStatus('error')
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setStatus('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Document Parser</h1>
            <p className="text-xs text-gray-500">AI-powered OCR extraction</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Upload card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Upload Document</h2>
            <p className="text-sm text-gray-500 mt-0.5">Supports PDF, JPEG, PNG, TIFF, WebP, BMP · Max 50 MB</p>
          </div>

          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
              ${file ? 'border-indigo-300 bg-indigo-50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={onInputChange}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-800 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(file.size)} · {file.type || 'unknown type'}</p>
                <p className="text-xs text-indigo-500">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium">Drop your file here or <span className="text-indigo-600">browse</span></p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSubmit}
              disabled={!file || status === 'loading'}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
                hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Extracting…
                </>
              ) : 'Extract'}
            </button>
            {(file || result) && (
              <button
                onClick={reset}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Result header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between
              ${status === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2">
                {status === 'success' ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={`text-sm font-semibold ${status === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {status === 'success' ? 'Extraction Complete' : 'Extraction Failed'}
                </span>
              </div>

              {status === 'success' && result.documentType && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {result.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  {result.language && (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {result.language}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* JSON output */}
            <div className="p-6">
              {status === 'error' ? (
                <div className="text-sm text-red-600 space-y-1">
                  <p className="font-medium">{result.error}</p>
                  {result.detail && <p className="text-red-400 font-mono text-xs">{result.detail}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Metadata row */}
                  {result.file && (
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 pb-4 border-b border-gray-100">
                      <span><span className="text-gray-600 font-medium">File:</span> {result.file.originalName}</span>
                      <span><span className="text-gray-600 font-medium">Size:</span> {formatBytes(result.file.size)}</span>
                      <span><span className="text-gray-600 font-medium">Type:</span> {result.file.mimeType}</span>
                    </div>
                  )}
                  {/* Extracted fields JSON */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Extracted Fields</p>
                    <JsonViewer data={result.fields ?? {}} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
