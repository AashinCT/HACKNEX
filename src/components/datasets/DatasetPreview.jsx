import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react'

const PAGE_SIZE = 10

function formatCell(column, value) {
  if (value == null) return null
  if (column.type === 'currency') return `₹${value.toLocaleString('en-IN')}`
  return value
}

export default function DatasetPreview({ columns, rows }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const missingCounts = useMemo(
    () =>
      Object.fromEntries(
        columns.map((c) => [c.key, rows.filter((r) => r[c.key] == null).length]),
      ),
    [columns, rows],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      columns.some((c) => String(row[c.key] ?? '').toLowerCase().includes(q)),
    )
  }, [rows, columns, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const start = currentPage * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  return (
    <section
      aria-labelledby="preview-heading"
      className="rounded-xl border border-line bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="preview-heading" className="text-lg font-semibold tracking-tight">
            Preview
          </h2>
          <p className="text-[13px] text-muted">
            A sample of rows. The full dataset is not loaded in the browser.
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <label htmlFor="preview-search" className="sr-only">
            Search rows
          </label>
          <input
            id="preview-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search rows"
            className="h-9 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none sm:w-56"
          />
        </div>
      </div>

      <div className="max-h-[28rem] overflow-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr>
              {columns.map((c) => {
                const right = c.type === 'currency'
                const missing = missingCounts[c.key]

                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={`sticky top-0 border-b border-line bg-slate-50 px-4 py-3 font-medium ${
                      right ? 'text-right' : ''
                    }`}
                  >
                    <span className="font-mono text-[13px]">{c.label}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] font-normal text-muted">
                      <span
                        className={`rounded border border-line bg-white px-1.5 py-px ${
                          right ? 'ml-auto' : ''
                        }`}
                      >
                        {c.type}
                      </span>
                      {missing > 0 && (
                        <span className="inline-flex items-center gap-1 text-warning">
                          <TriangleAlert size={11} aria-hidden="true" />
                          {missing} missing
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-muted"
                >
                  No rows match your search.
                </td>
              </tr>
            )}
            {visible.map((row, index) => (
              <tr key={start + index} className="transition-colors hover:bg-slate-50">
                {columns.map((c) => {
                  const cell = formatCell(c, row[c.key])
                  const right = c.type === 'currency'

                  return (
                    <td
                      key={c.key}
                      className={`px-4 py-3 ${right ? 'text-right tabular-nums' : ''}`}
                    >
                      {cell ?? (
                        <span className="text-warning">
                          <span aria-hidden="true">-</span>
                          <span className="sr-only">Missing value</span>
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px] text-muted">
        <span>
          {filtered.length === 0
            ? 'No rows'
            : `Showing ${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} rows`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2">
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            aria-label="Next page"
            className="rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}