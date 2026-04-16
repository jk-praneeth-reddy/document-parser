import { HomeIcon, Braces, ClockIcon, ScanLineIcon, BarChart3Icon } from 'lucide-react'

export type Page = 'home' | 'results' | 'parser' | 'quality' | 'history' | 'history-detail'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { id: 'home' as Page, label: 'Home', icon: HomeIcon },
  { id: 'parser' as Page, label: 'Parser', icon: Braces },
  { id: 'quality' as Page, label: 'Quality', icon: BarChart3Icon },
  { id: 'history' as Page, label: 'History', icon: ClockIcon },
]

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const activeNav =
    activePage === 'results'
      ? 'home'
      : activePage === 'history-detail'
        ? 'history'
        : activePage

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <ScanLineIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-base font-semibold text-gray-900 tracking-tight">
          DocuParse <span className="text-indigo-600">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeNav === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
