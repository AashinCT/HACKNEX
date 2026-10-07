import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BarChart3, Archive, ArrowRight } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import LoadingState from '../components/common/LoadingState'
import ModeTag from '../components/analysis/ModeTag'
import VerificationBadge from '../components/analysis/VerificationBadge'
import { getAnalyses } from '../services/api'

const modeOptions = [
  { value: 'all', label: 'All modes' },
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'blend', label: 'Blend' },
]

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'verified', label: 'Verified' },
  { value: 'warnings', label: 'Verified with warnings' },
  { value: 'unverified', label: 'Unable to verify' },
  { value: 'cannot_answer', label: 'Cannot answer reliably' },
]

const selectClass =
  'h-10 rounded-lg border border-line bg-white px-3 text-sm focus:border-accent focus:outline-none'

export default function Analyses() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('all')
  const [status, setStatus] = useState('all')

  function load() {
    setLoading(true)
    setError(false)
    getAnalyses()
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function handleArchive(id) {
    // Mock only. Later this will call the backend.
    setItems((current) => current.filter((a) => a.id !== id))
  }

  const filtered = items.filter(
    (a) =>
      a.question.toLowerCase().includes(query.trim().toLowerCase()) &&
      (mode === 'all' || a.mode === mode) &&
      (status === 'all' || a.status === status),
  )

  return (
    <>
      <PageHeader
        title="Analyses"
        subtitle="Review previous questions and their verified results."
      />

      {loading && <LoadingState rows={3} />}

      {error && (
        <ErrorState
          title="Unable to load analyses"
          message="Something went wrong while loading your analyses."
        >
          <Button onClick={load}>Try again</Button>
        </ErrorState>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No analyses yet"
          description="Your completed analyses will appear here."
        >
          <Link to="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </EmptyState>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:max-w-sm">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <label htmlFor="analysis-search" className="sr-only">
                Search analyses
              </label>
              <input
                id="analysis-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search analyses"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            <label htmlFor="mode-filter" className="sr-only">
              Filter by mode
            </label>
            <select
              id="mode-filter"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={selectClass}
            >
              {modeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching analyses"
              description="Try a different search term or clear a filter."
            />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line bg-white shadow-sm">
              {filtered.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 lg:flex-row lg:items-center lg:gap-6"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/analyses/${a.id}`}
                      className="block truncate text-sm font-medium hover:text-accent"
                    >
                      {a.question}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-muted">
                      Result: {a.result}, {a.sourceCount}{' '}
                      {a.sourceCount === 1 ? 'source' : 'sources'}
                    </p>
                  </div>
                  <ModeTag mode={a.mode} />
                  <VerificationBadge status={a.status} />
                  <span className="w-24 text-[13px] text-muted">{a.date}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/analyses/${a.id}`}
                      aria-label={`Open analysis: ${a.question}`}
                      className="rounded-md p-2 text-muted hover:bg-slate-100 hover:text-ink"
                    >
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleArchive(a.id)}
                      aria-label={`Archive analysis: ${a.question}`}
                      className="rounded-md p-2 text-muted hover:bg-slate-100 hover:text-ink"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  )
}