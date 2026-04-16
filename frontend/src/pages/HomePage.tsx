import { UploadCard } from '../components/UploadCard'

interface HomePageProps {
  onExtract: (file: File, parserId?: string) => void
  isExtracting: boolean
}

export function HomePage({ onExtract, isExtracting }: HomePageProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Document Parser</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a document and extract structured data using AI
        </p>
      </div>
      <UploadCard onExtract={onExtract} isExtracting={isExtracting} />
    </div>
  )
}
