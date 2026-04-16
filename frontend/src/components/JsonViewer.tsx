import { useState } from 'react'

export interface FieldEntry {
  value: unknown
  confidence: number
}

export type Fields = Record<string, FieldEntry>

interface Props {
  data: unknown
  confidenceThreshold?: number
  editMode?: boolean
  onFieldChange?: (key: string, newValue: string) => void
}

type ViewMode = 'table' | 'json'

function isFieldEntry(v: unknown): v is FieldEntry {
  return (
    typeof v === 'object' &&
    v !== null &&
    'value' in v &&
    'confidence' in v &&
    typeof (v as FieldEntry).confidence === 'number'
  )
}

function isFieldsObject(data: unknown): data is Fields {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false
  const entries = Object.values(data as object)
  return entries.length > 0 && entries.every(isFieldEntry)
}

function confidenceColor(c: number): string {
  if (c >= 0.9) return 'bg-emerald-500'
  if (c >= 0.7) return 'bg-amber-400'
  if (c >= 0.4) return 'bg-orange-400'
  return 'bg-red-500'
}

function confidenceTextColor(c: number): string {
  if (c >= 0.9) return 'text-emerald-600'
  if (c >= 0.7) return 'text-amber-600'
  if (c >= 0.4) return 'text-orange-500'
  return 'text-red-500'
}

function ValueCell({
  fieldKey,
  value,
  editMode,
  onFieldChange,
}: {
  fieldKey: string
  value: unknown
  editMode: boolean
  onFieldChange?: (key: string, newValue: string) => void
}) {
  if (editMode) {
    const displayVal = value === null || value === undefined ? '' : String(value)
    return (
      <input
        type="text"
        defaultValue={displayVal}
        onBlur={(e) => onFieldChange?.(fieldKey, e.target.value)}
        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">null</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic">empty</span>
    return (
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              {Object.keys((value[0] as object) ?? {})
                .filter((k) => k !== 'confidence')
                .map((k) => (
                  <th key={k} className="px-2 py-1 text-left font-semibold text-gray-600 border border-gray-200">
                    {k}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {(value as Record<string, unknown>[]).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {Object.entries(row)
                  .filter(([k]) => k !== 'confidence')
                  .map(([k, v]) => (
                    <td key={k} className="px-2 py-1 border border-gray-200 text-gray-700">
                      {v === null ? <span className="text-gray-400 italic">null</span> : String(v)}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (typeof value === 'object') {
    return <span className="font-mono text-xs text-gray-600">{JSON.stringify(value)}</span>
  }
  return <span className="text-gray-800">{String(value)}</span>
}

function FieldsTable({
  fields,
  editMode,
  onFieldChange,
}: {
  fields: Fields
  editMode: boolean
  onFieldChange?: (key: string, newValue: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide w-40">
              Field
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">
              Value
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide w-36">
              Confidence
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.entries(fields).map(([key, entry]) => (
            <tr key={key} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-600 align-top">
                {key}
              </td>
              <td className="px-4 py-3 text-gray-800 align-top max-w-xs">
                <ValueCell
                  fieldKey={key}
                  value={entry.value}
                  editMode={editMode}
                  onFieldChange={onFieldChange}
                />
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[48px]">
                    <div
                      className={`h-full rounded-full transition-all ${confidenceColor(entry.confidence)}`}
                      style={{ width: `${Math.round(entry.confidence * 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium tabular-nums whitespace-nowrap ${confidenceTextColor(entry.confidence)}`}
                  >
                    {Math.round(entry.confidence * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function highlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="text-gray-400">${match}</span>`
        return `<span class="text-gray-200">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span class="text-gray-500">${match}</span>`
      if (/null/.test(match)) return `<span class="text-gray-500">${match}</span>`
      return `<span class="text-gray-300">${match}</span>`
    }
  )
}

function RawJson({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2)
  const copy = () => navigator.clipboard.writeText(json)

  return (
    <div className="relative group rounded-xl bg-gray-950 overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-3 right-3 z-10 px-2.5 py-1 text-xs text-gray-400 bg-gray-800
          hover:bg-gray-700 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
      >
        Copy
      </button>
      <pre
        className="text-sm font-mono p-5 overflow-auto max-h-[500px] leading-relaxed text-gray-100"
        dangerouslySetInnerHTML={{ __html: highlight(json) }}
      />
    </div>
  )
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {(['table', 'json'] as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all capitalize
            ${mode === m
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {m === 'table' ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          )}
          {m}
        </button>
      ))}
    </div>
  )
}

export default function JsonViewer({
  data,
  confidenceThreshold = 0,
  editMode = false,
  onFieldChange,
}: Props) {
  const [mode, setMode] = useState<ViewMode>('table')
  const hasFields = isFieldsObject(data)

  // Apply confidence filter
  const filteredData: unknown = hasFields
    ? Object.fromEntries(
        Object.entries(data as Fields).filter(
          ([, entry]) => entry.confidence >= confidenceThreshold
        )
      )
    : data

  const filteredHasFields = isFieldsObject(filteredData)
  const filteredCount = hasFields
    ? Object.keys(data as Fields).length - Object.keys(filteredData as object).length
    : 0

  return (
    <div className="space-y-3">
      {hasFields && (
        <div className="flex items-center justify-between">
          {filteredCount > 0 && (
            <span className="text-xs text-gray-400">
              {filteredCount} field{filteredCount !== 1 ? 's' : ''} hidden by confidence filter
            </span>
          )}
          <div className={filteredCount > 0 ? '' : 'ml-auto'}>
            <ViewToggle mode={mode} onChange={setMode} />
          </div>
        </div>
      )}

      {filteredHasFields && mode === 'table' ? (
        <FieldsTable
          fields={filteredData as Fields}
          editMode={editMode}
          onFieldChange={onFieldChange}
        />
      ) : (
        <RawJson data={filteredData} />
      )}
    </div>
  )
}
