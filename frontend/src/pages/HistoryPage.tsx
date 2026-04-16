import { useEffect, useState } from 'react'
import { FileTextIcon, ExternalLinkIcon, ClockIcon } from 'lucide-react'
import api from '../utils/api'
import type { FieldEntry } from '../components/JsonViewer'

export interface HistoryEntry {
  id: string
  originalName: string
  savedAs: string
  mimeType: string
  size: number
  documentType: string | null
  language: string | null
  fields: Record<string, FieldEntry>
  extractedAt: string
}

interface HistoryPageProps {
  refreshKey: number
  onViewDetail: (entry: HistoryEntry) => void
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function HistoryPage({ refreshKey, onViewDetail }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get<{ success: boolean; history: HistoryEntry[] }>('/ocr/history')
      .then((res) => setHistory(res.data.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [refreshKey])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <ClockIcon className="w-5 h-5 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-sm text-gray-500 mt-0.5">All past document extractions</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <ClockIcon className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No extractions yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload and extract a document to see it here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Document
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Output
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  {/* Document name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <FileTextIcon className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">
                          {entry.originalName}
                        </p>
                        <p className="text-xs text-gray-400">{formatBytes(entry.size)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Doc type */}
                  <td className="px-5 py-4">
                    {entry.documentType ? (
                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {formatDocType(entry.documentType)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Unknown</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(entry.extractedAt)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Completed
                    </span>
                  </td>

                  {/* Output link */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onViewDetail(entry)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                      View Output
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
