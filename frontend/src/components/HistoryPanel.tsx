import { useEffect, useState } from 'react'
import { ClockIcon, FileTextIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import JsonViewer, { type Fields, type FieldEntry } from './JsonViewer'
import api from '../utils/api'

interface HistoryEntry {
  id: string
  originalName: string
  mimeType: string
  size: number
  documentType: string | null
  language: string | null
  fields: Record<string, FieldEntry>
  extractedAt: string
}

interface HistoryPanelProps {
  refreshKey: number
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

export function HistoryPanel({ refreshKey }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(0)

  useEffect(() => {
    setLoading(true)
    api
      .get<{ success: boolean; history: HistoryEntry[] }>('/ocr/history')
      .then((res) => setHistory(res.data.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">History</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">History</h2>
        <p className="text-sm text-gray-400">No extractions yet. Upload a document to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-gray-400" />
        <h2 className="text-base font-semibold text-gray-800">History</h2>
        <span className="ml-auto text-xs text-gray-400">{history.length} extraction{history.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="divide-y divide-gray-100">
        {history.map((entry) => {
          const isExpanded = expandedId === entry.id
          const fieldCount = Object.keys(entry.fields).length

          return (
            <div key={entry.id}>
              {/* Row */}
              <button
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-4.5 h-4.5 text-indigo-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{entry.originalName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {entry.documentType && (
                      <span className="text-xs text-indigo-600 font-medium">
                        {formatDocType(entry.documentType)}
                      </span>
                    )}
                    {entry.language && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{entry.language}</span>
                      </>
                    )}
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{fieldCount} fields</span>
                  </div>
                </div>

                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(entry.extractedAt)}</span>
                {isExpanded
                  ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
              </button>

              {/* Expanded read-only detail */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4 bg-gray-50 border-t border-gray-100">
                  {/* Document metadata */}
                  <div className="flex flex-wrap gap-3 pt-4 text-xs text-gray-400">
                    {entry.documentType && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 font-medium rounded-full">
                        {formatDocType(entry.documentType)}
                      </span>
                    )}
                    {entry.language && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 font-medium rounded-full">
                        {entry.language}
                      </span>
                    )}
                    <span className="self-center">{new Date(entry.extractedAt).toLocaleString()}</span>
                  </div>

                  {/* Confidence slider for history view */}
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3 min-h-[2rem]">
                      <span className="text-xs font-medium text-gray-600 shrink-0">Min confidence</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(threshold * 100)}
                        onChange={(e) => setThreshold(Number(e.target.value) / 100)}
                        className="flex-1 h-2 accent-gray-700 cursor-pointer min-w-0"
                      />
                      <span className="text-xs font-medium text-gray-700 w-10 text-right tabular-nums shrink-0">
                        {Math.round(threshold * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Read-only fields */}
                  <JsonViewer
                    data={entry.fields as Fields}
                    confidenceThreshold={threshold}
                    editMode={false}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
