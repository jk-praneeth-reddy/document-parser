import { useState } from 'react'
import { Sidebar, type Page } from './components/Sidebar'
import { HomePage } from './pages/HomePage'
import { ResultsPage } from './pages/ResultsPage'
import { ParserPage } from './pages/ParserPage'
import { HistoryPage, type HistoryEntry } from './pages/HistoryPage'
import { HistoryDetailPage } from './pages/HistoryDetailPage'
import type { Fields } from './components/JsonViewer'
import api from './utils/api'

interface ExtractResult {
  historyId: string
  file: {
    originalName: string
    savedAs: string
    mimeType: string
    size: number
  }
  documentType: string
  language: string | null
  fields: Fields
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  // Results state
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null)

  // History detail state
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  // Trigger history re-fetch
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const refreshHistory = () => setHistoryRefreshKey((k) => k + 1)

  const handleExtract = async (file: File) => {
    setIsExtracting(true)
    setExtractError(null)
    setCurrentFile(file)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await api.post<ExtractResult>('/ocr/extract', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setExtractResult(res.data)
      setPage('results')
      refreshHistory()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setExtractError(axiosErr.response?.data?.error ?? 'Network error — is the backend running?')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleViewDetail = (entry: HistoryEntry) => {
    setSelectedEntry(entry)
    setPage('history-detail')
  }

  const handleNavigate = (p: Page) => {
    // Don't allow direct nav to results/history-detail via sidebar
    if (p === 'results' || p === 'history-detail') return
    setPage(p)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activePage={page} onNavigate={handleNavigate} />

      <div className="flex-1 overflow-auto">
        {/* Home page */}
        {page === 'home' && (
          <div>
            <HomePage onExtract={handleExtract} isExtracting={isExtracting} />
            {extractError && (
              <div className="max-w-2xl mx-auto px-6 pb-6">
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 font-medium">{extractError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results page — after extraction */}
        {page === 'results' && extractResult && currentFile && (
          <ResultsPage
            file={currentFile}
            historyId={extractResult.historyId}
            documentType={extractResult.documentType}
            language={extractResult.language}
            fields={extractResult.fields}
            onBack={() => setPage('home')}
            onFieldsSaved={refreshHistory}
          />
        )}

        {/* Parser page */}
        {page === 'parser' && <ParserPage />}

        {/* History list */}
        {page === 'history' && (
          <HistoryPage
            refreshKey={historyRefreshKey}
            onViewDetail={handleViewDetail}
          />
        )}

        {/* History detail */}
        {page === 'history-detail' && selectedEntry && (
          <HistoryDetailPage
            entry={selectedEntry}
            onBack={() => setPage('history')}
            onFieldsSaved={refreshHistory}
          />
        )}
      </div>
    </div>
  )
}
