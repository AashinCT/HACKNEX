import { useLocation } from 'react-router-dom'
import { Menu, Search, Bell } from 'lucide-react'

const titles = {
  dashboard: 'Dashboard',
  analyses: 'Analyses',
  datasets: 'Datasets',
  evidence: 'Evidence',
  settings: 'Settings',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const section = pathname.split('/')[1]
  const title = titles[section] ?? 'Data Intelligence'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-md p-2 text-muted hover:bg-slate-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <h2 className="text-sm font-semibold text-ink">{title}</h2>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <label htmlFor="global-search" className="sr-only">
            Search
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="Search"
            className="h-9 w-64 rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-2 text-muted hover:bg-slate-100"
        >
          <Bell size={18} />
        </button>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
          aria-label="Signed in as David Srinivasan"
        >
          DS
        </div>
      </div>
    </header>
  )
}