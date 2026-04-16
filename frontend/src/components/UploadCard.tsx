import React, { useCallback, useRef, useState } from 'react'
import { UploadCloudIcon, FileTextIcon, XIcon } from 'lucide-react'
import { DocumentTypeChips } from './DocumentTypeChips'

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.bmp'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface UploadCardProps {
  onExtract: (file: File) => void
  isExtracting: boolean
}

export function UploadCard({ onExtract, isExtracting }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const handleFile = useCallback((f: File) => setFile(f), [])

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (dragCounterRef.current === 1) setDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setDragOver(false)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const handleReset = () => {
    setFile(null)
    dragCounterRef.current = 0
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-800">Upload Document</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Supports PDF, JPEG, PNG, TIFF, WebP, BMP · Max 50 MB
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
          ${file ? 'border-indigo-300 bg-indigo-50/40' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={onInputChange}
        />

        {file ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleReset()
              }}
              className="absolute -top-6 -right-6 p-2 rounded-lg hover:bg-white transition-colors"
              aria-label="Clear file"
            >
              <XIcon className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <FileTextIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="font-medium text-gray-800 text-sm">{file.name}</p>
            <p className="text-xs text-gray-400">{formatBytes(file.size)} · {file.type || 'unknown type'}</p>
            <p className="text-xs text-indigo-500">Click to change file</p>
          </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <UploadCloudIcon className={`w-10 h-10 mb-1 transition-colors ${dragOver ? 'text-indigo-500' : ''}`} />
            <p className="text-sm font-medium text-gray-700">
              {dragOver ? 'Drop your document here' : 'Drag and drop your document here'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
          </div>
        )}
      </div>

      {/* Document type chips */}
      <DocumentTypeChips />

      {/* Actions */}
      <div>
        <button
          onClick={() => file && onExtract(file)}
          disabled={!file || isExtracting}
          className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
            hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isExtracting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Extracting…
            </>
          ) : 'Extract'}
        </button>
      </div>
    </div>
  )
}
