import { useEffect, useRef, useState } from 'react'
import { PencilIcon, SaveIcon, XIcon } from 'lucide-react'
import JsonViewer, { type Fields, type FieldEntry } from './JsonViewer'
import api from '../utils/api'

interface FieldsPanelProps {
  historyId: string
  documentType: string
  language: string | null
  fields: Fields
  /** If false, hides edit button (read-only mode for history detail) */
  editable?: boolean
  onFieldsSaved?: () => void
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function FieldsPanel({
  historyId,
  documentType,
  language,
  fields,
  editable = true,
  onFieldsSaved,
}: FieldsPanelProps) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(0)

  const editedRef = useRef<Fields>(structuredClone(fields))

  useEffect(() => {
    editedRef.current = structuredClone(fields)
    setEditMode(false)
    setSaveError(null)
    setThreshold(0)
  }, [historyId])

  const handleFieldChange = (key: string, newValue: string) => {
    const existing = editedRef.current[key]
    editedRef.current = {
      ...editedRef.current,
      [key]: { value: newValue, confidence: existing?.confidence ?? 1 } as FieldEntry,
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await api.patch(`/ocr/history/${historyId}`, { fields: editedRef.current })
      setEditMode(false)
      onFieldsSaved?.()
    } catch {
      setSaveError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    editedRef.current = structuredClone(fields)
    setSaveError(null)
    setEditMode(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Doc type + language */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
          {formatDocType(documentType)}
        </span>
        {language && (
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {language}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4 pb-4 border-b border-gray-100 mb-4">
        <div className="w-full sm:flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
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

        {/* Edit / Save / Cancel */}
        {editable && (
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
                  onClick={handleCancel}
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
        )}
      </div>

      {saveError && (
        <p className="text-xs text-red-500 font-medium mb-3">{saveError}</p>
      )}

      {/* Fields viewer — scrollable */}
      <div className="flex-1 overflow-auto">
        <JsonViewer
          data={editMode ? editedRef.current : fields}
          confidenceThreshold={threshold}
          editMode={editMode}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  )
}
