import { useEffect, useRef, useState } from 'react'
import { PencilIcon, SaveIcon, XIcon } from 'lucide-react'
import JsonViewer, { type Fields, type FieldEntry } from './JsonViewer'
import api from '../utils/api'

type ViewMode = 'table' | 'json'

interface FieldsPanelProps {
  historyId: string
  documentType: string
  language: string | null
  fields: Fields
  editable?: boolean
  onFieldsSaved?: () => void
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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

export function FieldsPanel({
  historyId,
  documentType,
  language,
  fields,
  editable = true,
  onFieldsSaved,
}: FieldsPanelProps) {
  const [editMode, setEditMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  // Local copy of fields so updates are reflected immediately after save
  const [localFields, setLocalFields] = useState<Fields>(structuredClone(fields))

  const editedRef = useRef<Fields>(structuredClone(fields))

  useEffect(() => {
    const copy = structuredClone(fields)
    setLocalFields(copy)
    editedRef.current = copy
    setEditMode(false)
    setSaveError(null)
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
      setLocalFields(structuredClone(editedRef.current))
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
      {/* Single header row: badges · toggle · edit */}
      <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-gray-100 mb-4">
        {/* Doc type + language */}
        <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
          {formatDocType(documentType)}
        </span>
        {language && (
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {language}
          </span>
        )}

        {/* Push toggle + edit to the right */}
        <div className="flex items-center gap-2 ml-auto">
          <ViewToggle mode={viewMode} onChange={setViewMode} />

          {editable && (
            editMode ? (
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
            )
          )}
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-red-500 font-medium mb-3">{saveError}</p>
      )}

      {/* Fields viewer */}
      <div className="flex-1 overflow-auto">
        <JsonViewer
          data={editMode ? editedRef.current : localFields}
          viewMode={viewMode}
          editMode={editMode}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  )
}
