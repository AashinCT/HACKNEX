import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import VerificationBadge from '../analysis/VerificationBadge'
import { modeIcons } from '../analysis/ModeSelector'
import { modes, recentAnalyses } from '../../data/mockData'

function ModeTag({ mode }) {
  const Icon = modeIcons[mode]
  const label = modes.find((m) => m.id === mode)?.label

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  )
}

export default function RecentAnalyses() {
  return (
    <section
      aria-labelledby="recent-heading"
      className="rounded-xl border border-line bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 id="recent-heading" className="text-lg font-semibold tracking-tight">
          Recent analyses
        </h2>
        <Link
          to="/analyses"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          View all
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <ul className="divide-y divide-line">
        {recentAnalyses.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-6"
          >
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              {item.question}
            </p>
            <ModeTag mode={item.mode} />
            <VerificationBadge status={item.status} />
            <span className="w-20 text-[13px] text-muted sm:text-right">
              {item.date}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}