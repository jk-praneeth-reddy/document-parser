import { useEffect, useRef, useState } from 'react'
import { CheckCircleIcon, PencilIcon, SaveIcon, XIcon } from 'lucide-react'
import JsonViewer, { type Fields, type FieldEntry } from './JsonViewer'
import api from '../utils/api'

interface FileInfo {
  originalName: string
  mimeType: string
  size: number
}

interface OcrResult {
  historyId: string
  file: FileInfo
  documentType: string
  language: string | null
  fields: Fields
}

interface ResultPanelProps {
  result: OcrResult
  onFieldsSaved: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ResultPanel({ result, onFieldsSaved }: ResultPanelProps) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Keep a mutable ref copy of edited fields so we don't re-render on every keystroke
  const editedFieldsRef = useRef<Fields>(structuredClone(result.fields))

  // Reset edits when a new result comes in
  useEffect(() => {
    editedFieldsRef.current = structuredClone(result.fields)
    setEditMode(false)
    setSaveError(null)
  }, [result.historyId])

  const handleFieldChange = (key: string, newValue: string) => {
    const existing = editedFieldsRef.current[key]
    editedFieldsRef.current = {
      ...editedFieldsRef.current,
      [key]: { value: newValue, confidence: existing?.confidence ?? 1 } as FieldEntry,
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await api.patch(`/ocr/history/${result.historyId}`, {
        fields: editedFieldsRef.current,
      })
      setEditMode(false)
      onFieldsSaved()
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    editedFieldsRef.current = structuredClone(result.fields)
    setSaveError(null)
    setEditMode(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Extraction Complete</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
            {formatDocType(result.documentType)}
          </span>
          {result.language && (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {result.language}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* File metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 pb-4 border-b border-gray-100">
          <span><span className="text-gray-600 font-medium">File:</span> {result.file.originalName}</span>
          <span><span className="text-gray-600 font-medium">Size:</span> {formatBytes(result.file.size)}</span>
          <span><span className="text-gray-600 font-medium">Type:</span> {result.file.mimeType}</span>
        </div>

        {/* Controls row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end sm:gap-4">
          {/* Edit / Save / Cancel */}
          <div className="flex items-center gap-2 sm:shrink-0">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <SaveIcon className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <XIcon className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        {saveError && (
          <p className="text-xs text-red-500 font-medium">{saveError}</p>
        )}

        {/* Fields viewer */}
        <JsonViewer
          data={editMode ? editedFieldsRef.current : result.fields}
          editMode={editMode}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  )
}
