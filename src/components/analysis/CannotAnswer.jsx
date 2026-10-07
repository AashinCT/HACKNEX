import { Link } from 'react-router-dom'
import { CircleX } from 'lucide-react'
import Button from '../common/Button'
import VerificationBadge from './VerificationBadge'

export default function CannotAnswer({ analysis }) {
  const reason = analysis.reason || analysis.explanation || 'The backend could not safely answer this question.'
  const profile = analysis.evidence?.profile
  const available = profile?.column_names || []
  return (
    <section aria-labelledby="cannot-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger"><CircleX size={20} /></span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="cannot-heading" className="text-xl font-semibold tracking-tight">Cannot answer reliably</h2>
            <VerificationBadge status="cannot_answer" />
          </div>
          <p className="mt-2 text-sm text-muted">{reason}</p>
        </div>
      </div>

      {available.length > 0 && (
        <div className="mt-6 rounded-lg border border-line bg-canvas p-4">
          <h3 className="text-sm font-semibold">Available columns</h3>
          <p className="mt-2 text-sm text-muted">{available.join(', ')}</p>
        </div>
      )}

      <p className="mt-5 text-[13px] text-muted">No estimate or unsupported value was generated.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/datasets"><Button variant="secondary">Add a dataset</Button></Link>
        <Link to="/dashboard"><Button variant="secondary">Ask a different question</Button></Link>
      </div>
    </section>
  )
}
