import { ArrowLeftIcon } from 'lucide-react'
import { FilePreview } from '../components/FilePreview'
import { FieldsPanel } from '../components/FieldsPanel'
import type { Fields } from '../components/JsonViewer'

interface ResultsPageProps {
  file: File
  historyId: string
  documentType: string
  language: string | null
  fields: Fields
  onBack: () => void
  onFieldsSaved: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ResultsPage({
  file,
  historyId,
  documentType,
  language,
  fields,
  onBack,
  onFieldsSaved,
}: ResultsPageProps) {
  const fileUrl = URL.createObjectURL(file)

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
          Extraction Complete
        </span>
      </div>

      {/* Side-by-side content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — file preview */}
        <div className="flex-1 p-4 overflow-auto border-r border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Document Preview
          </p>
          <div className="h-[calc(100%-2rem)]">
            <FilePreview url={fileUrl} mimeType={file.type} fileName={file.name} />
          </div>
        </div>

        {/* Right — extracted fields */}
        <div className="flex-1 p-6 overflow-auto bg-white">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Extracted Fields
          </p>
          <FieldsPanel
            historyId={historyId}
            documentType={documentType}
            language={language}
            fields={fields}
            editable={true}
            onFieldsSaved={onFieldsSaved}
          />
        </div>
      </div>
    </div>
  )
}
