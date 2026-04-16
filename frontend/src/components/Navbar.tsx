import { ScanLineIcon } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="w-full px-6 py-3 flex items-center border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <ScanLineIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-base font-semibold text-gray-900 tracking-tight">
          DocuParse <span className="text-indigo-600">AI</span>
        </span>
      </div>
    </nav>
  )
}
