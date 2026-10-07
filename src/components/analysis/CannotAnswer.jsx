import { Link } from 'react-router-dom'
import { CircleX, Check, X } from 'lucide-react'
import Button from '../common/Button'
import VerificationBadge from './VerificationBadge'

export default function CannotAnswer({ analysis }) {
  return (
    <section
      aria-labelledby="cannot-heading"
      className="rounded-xl border border-line bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger">
            <CircleX size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="cannot-heading" className="text-xl font-semibold tracking-tight">
              Cannot answer reliably
            </h2>
            <p className="mt-1 text-sm text-muted">{analysis.explanation}</p>
          </div>
        </div>
        <VerificationBadge status="cannot_answer" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-red-100 bg-red-50/50 p-4">
          <h3 className="text-sm font-semibold">Required</h3>
          <ul className="mt-2 space-y-1.5">
            {analysis.missing.required.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <X size={14} className="text-danger" aria-hidden="true" />
                {item}
                <span className="sr-only"> (not available)</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-line bg-canvas p-4">
          <h3 className="text-sm font-semibold">Available</h3>
          <ul className="mt-2 space-y-1.5">
            {analysis.missing.available.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-5 text-[13px] text-muted">
        No answer was generated, so nothing has been estimated or assumed.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/datasets">
          <Button variant="secondary">Add a dataset</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary">Ask a different question</Button>
        </Link>
      </div>
    </section>
  )
}