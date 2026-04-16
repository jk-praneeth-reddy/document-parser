import { ZapIcon } from 'lucide-react'

export function ParserPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <ZapIcon className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Parser</h2>
      <p className="text-sm text-gray-400 max-w-xs">
        This section is coming soon.
      </p>
    </div>
  )
}
