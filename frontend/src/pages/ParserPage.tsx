import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeftIcon,
  Braces,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import api from '../utils/api'

export interface ParserFieldRow {
  field: string
  description: string
}

export interface Parser {
  id: string
  name: string
  description: string
  documentType: string
  fields: ParserFieldRow[]
  createdAt: string
}

type Screen = 'list' | 'form'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDocType(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const emptyFieldRow = (): ParserFieldRow => ({ field: '', description: '' })

export function ParserPage() {
  const [screen, setScreen] = useState<Screen>('list')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [parsers, setParsers] = useState<Parser[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [parserDescription, setParserDescription] = useState('')
  const [fieldRows, setFieldRows] = useState<ParserFieldRow[]>([emptyFieldRow()])

  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadList = useCallback(() => {
    setListLoading(true)
    setListError(null)
    api
      .get<{ success: boolean; parsers?: Parser[] }>('/parsers')
      .then((res) => setParsers(res.data.parsers ?? []))
      .catch(() => {
        setListError('Could not load parsers.')
        setParsers([])
      })
      .finally(() => setListLoading(false))
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  const resetForm = () => {
    setName('')
    setDocumentType('')
    setParserDescription('')
    setFieldRows([emptyFieldRow()])
    setFormError(null)
  }

  const openCreate = () => {
    setEditingId(null)
    resetForm()
    setScreen('form')
  }

  const openEdit = async (id: string) => {
    setEditingId(id)
    setFormError(null)
    setScreen('form')
    setFormLoading(true)
    try {
      const res = await api.get<{ success: boolean; parser?: Parser }>(`/parsers/${id}`)
      const p = res.data.parser
      if (!p) throw new Error('Missing parser')
      setName(p.name)
      setDocumentType(p.documentType)
      setParserDescription(p.description)
      setFieldRows(p.fields.length > 0 ? p.fields.map((f) => ({ ...f })) : [emptyFieldRow()])
    } catch {
      setFormError('Failed to load parser.')
      resetForm()
    } finally {
      setFormLoading(false)
    }
  }

  const backToList = () => {
    setScreen('list')
    setEditingId(null)
    resetForm()
    loadList()
  }

  const addFieldRow = () => {
    setFieldRows((rows) => [...rows, emptyFieldRow()])
  }

  const removeFieldRow = (index: number) => {
    setFieldRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)))
  }

  const updateFieldRow = (index: number, patch: Partial<ParserFieldRow>) => {
    setFieldRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  const handleSave = async () => {
    setFormError(null)
    const trimmedFields = fieldRows
      .map((r) => ({ field: r.field.trim(), description: r.description.trim() }))
      .filter((r) => r.field.length > 0)

    if (!name.trim()) {
      setFormError('Parser name is required.')
      return
    }
    if (!documentType.trim()) {
      setFormError('Document type is required.')
      return
    }
    if (trimmedFields.length === 0) {
      setFormError('Add at least one field with a name.')
      return
    }

    setSaving(true)
    try {
      const body = {
        name: name.trim(),
        description: parserDescription.trim(),
        documentType: documentType.trim(),
        fields: trimmedFields,
      }
      if (editingId) {
        await api.put(`/parsers/${editingId}`, body)
      } else {
        await api.post('/parsers', body)
      }
      backToList()
    } catch {
      setFormError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (screen === 'form') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          type="button"
          onClick={backToList}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to parsers
        </button>

        <div className="mb-2">
          <div className="flex items-center gap-3">
            <Braces className="w-7 h-7 text-indigo-600 shrink-0" strokeWidth={2} />
            <h1 className="text-2xl font-bold text-gray-900">
              {editingId ? 'Edit parser' : 'Create parser'}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            Define how documents of this type should be parsed
          </p>
        </div>

        {formLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2Icon className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="parser-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Parser name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="parser-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. ACME Invoice"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Document type <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="doc-type"
                    type="text"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    placeholder="e.g. invoice, pan_card (match OCR document type)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="parser-desc" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="parser-desc"
                    value={parserDescription}
                    onChange={(e) => setParserDescription(e.target.value)}
                    rows={3}
                    placeholder="Short summary shown in the parser list"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Data fields
                </h2>
                <button
                  type="button"
                  onClick={addFieldRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                    border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Add field
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Field names should use camelCase where possible. At least one field is required.
              </p>

              <div className="space-y-3">
                {fieldRows.map((row, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/80"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Field <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={row.field}
                        onChange={(e) => updateFieldRow(index, { field: e.target.value })}
                        placeholder="e.g. invoiceNumber"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                          placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div className="flex-[2] min-w-0 space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Description</label>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateFieldRow(index, { description: e.target.value })}
                        placeholder="What this field represents"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                          placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div className="flex items-end sm:pb-0.5">
                      <button
                        type="button"
                        onClick={() => removeFieldRow(index)}
                        disabled={fieldRows.length <= 1}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50
                          disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent transition-colors"
                        aria-label="Remove field row"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
                  hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save parser'
                )}
              </button>
              <button
                type="button"
                onClick={backToList}
                disabled={saving}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Braces className="w-7 h-7 text-indigo-500 shrink-0" strokeWidth={2} />
            <h1 className="text-2xl font-bold text-gray-900">Parsers</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">Templates for document types and fields</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
            hover:bg-indigo-700 transition-colors shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          Create parser
        </button>
      </div>

      {listError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {listError}
        </div>
      )}

      {listLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : parsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-200 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <Braces className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No parsers yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-6">Create one to define fields for a document type</p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
          >
            <PlusIcon className="w-4 h-4" />
            Create parser
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-left">
                    Parser name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap text-left">
                    Created date
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[140px] text-center">
                    Description
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-left">
                    Document type
                  </th>
                  <th className="px-4 py-3 w-12" aria-hidden />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 text-left align-middle">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums text-left align-middle">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 max-w-xs align-middle text-gray-600">
                      {p.description ? (
                        <span className="line-clamp-2 block text-left">{p.description}</span>
                      ) : (
                        <div className="flex w-full justify-center items-center min-h-[1.25rem] text-gray-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-left align-middle">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {formatDocType(p.documentType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEdit(p.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        aria-label={`Edit ${p.name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
