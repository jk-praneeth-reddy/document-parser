import { ArrowLeftIcon } from 'lucide-react'
import { FilePreview } from '../components/FilePreview'
import { FieldsPanel } from '../components/FieldsPanel'
import type { HistoryEntry } from './HistoryPage'

interface HistoryDetailPageProps {
  entry: HistoryEntry
  onBack: () => void
  onFieldsSaved: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function HistoryDetailPage({ entry, onBack, onFieldsSaved }: HistoryDetailPageProps) {
  const fileUrl = `/api/uploads/${entry.savedAs}`

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to History
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{entry.originalName}</p>
          <p className="text-xs text-gray-400">{formatBytes(entry.size)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Completed
        </span>
      </div>

      {/* Side-by-side content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — file preview served from backend */}
        <div className="flex-1 p-4 overflow-auto border-r border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Document Preview
          </p>
          <div className="h-[calc(100%-2rem)]">
            <FilePreview url={fileUrl} mimeType={entry.mimeType} fileName={entry.originalName} />
          </div>
        </div>

        {/* Right — extracted fields (editable) */}
        <div className="flex-1 p-6 overflow-auto bg-white">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Extracted Fields
          </p>
          <FieldsPanel
            historyId={entry.id}
            documentType={entry.documentType ?? 'Unknown'}
            language={entry.language}
            fields={entry.fields}
            editable={true}
            onFieldsSaved={onFieldsSaved}
          />
        </div>
      </div>
    </div>
  )
}
