import { useEffect, useState } from 'react'
import { BarChart3Icon, Loader2Icon, RefreshCwIcon } from 'lucide-react'
import api from '../utils/api'

export interface DocumentTypeQualityMetrics {
  documentType: string
  extractions: number
  documentsWithCorrections: number
  correctionEvents: number
  documentEditRatePercent: number
  avgCorrectionsPerExtraction: number
}

export interface CorrectionMetrics {
  totalExtractions: number
  totalCorrectionEvents: number
  documentsWithCorrections: number
  documentEditRatePercent: number
  avgCorrectionsPerExtraction: number
  avgCorrectionsAmongEditedDocs: number | null
  byDocumentType: DocumentTypeQualityMetrics[]
}

interface QualityPageProps {
  refreshKey: number
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export function QualityPage({ refreshKey }: QualityPageProps) {
  const [metrics, setMetrics] = useState<CorrectionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    api
      .get<{ success: boolean; metrics?: CorrectionMetrics }>('/ocr/metrics')
      .then((res) => {
        if (res.data.metrics) setMetrics(res.data.metrics)
        else setMetrics(null)
      })
      .catch(() => {
        setError('Could not load quality metrics.')
        setMetrics(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [refreshKey])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <BarChart3Icon className="w-7 h-7 text-indigo-600 shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quality</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Correction-based signals from human edits. “Edit rate” is the share of extractions where
              at least one field was changed after review — a proxy for how often the model needed a
              fix, not full accuracy against a labeled test set.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !metrics ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : metrics && metrics.totalExtractions === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-200 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <BarChart3Icon className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No extractions yet</p>
          <p className="text-xs text-gray-400 mt-1">Run an extraction, then edit and save fields to build metrics</p>
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Extractions"
              value={String(metrics.totalExtractions)}
              hint="Total documents in history"
            />
            <StatCard
              label="Document edit rate"
              value={`${metrics.documentEditRatePercent}%`}
              hint="% of extractions with ≥1 field correction"
            />
            <StatCard
              label="Field corrections / doc"
              value={String(metrics.avgCorrectionsPerExtraction)}
              hint="Mean correction rows per extraction"
            />
            <StatCard
              label="Corrections / edited doc"
              value={
                metrics.avgCorrectionsAmongEditedDocs != null
                  ? String(metrics.avgCorrectionsAmongEditedDocs)
                  : '—'
              }
              hint={metrics.documentsWithCorrections > 0 ? 'Among docs that were edited' : 'No edits yet'}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">By document type</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {metrics.totalCorrectionEvents} total field-level corrections recorded
              </p>
            </div>
            {metrics.byDocumentType.length === 0 ? (
              <p className="px-5 py-10 text-sm text-gray-500 text-center">No breakdown available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide tabular-nums">
                        Extractions
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide tabular-nums">
                        Edited docs
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide tabular-nums">
                        Edit rate
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide tabular-nums">
                        Corrections
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide tabular-nums">
                        Avg / doc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {metrics.byDocumentType.map((row) => (
                      <tr key={row.documentType} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatDocType(row.documentType)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">{row.extractions}</td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {row.documentsWithCorrections}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {row.documentEditRatePercent}%
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {row.correctionEvents}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {row.avgCorrectionsPerExtraction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
