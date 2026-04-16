import { FileTextIcon } from 'lucide-react'

interface FilePreviewProps {
  url: string
  mimeType: string
  fileName: string
}

export function FilePreview({ url, mimeType, fileName }: FilePreviewProps) {
  const isImage = mimeType.startsWith('image/')
  const isPdf = mimeType === 'application/pdf' || mimeType === 'application/x-pdf'

  if (isImage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <img
          src={url}
          alt={fileName}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200">
        <iframe
          src={url}
          title={fileName}
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        />
      </div>
    )
  }

  // Fallback for unsupported preview types
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
        <FileTextIcon className="w-8 h-8 text-indigo-400" />
      </div>
      <p className="text-sm font-medium text-gray-600">{fileName}</p>
      <p className="text-xs text-gray-400">Preview not available for this file type</p>
    </div>
  )
}
