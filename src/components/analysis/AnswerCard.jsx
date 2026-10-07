import { ShieldCheck, FileSearch, Code2, RotateCcw, Download } from 'lucide-react'
import Button from '../common/Button'
import VerificationBadge from './VerificationBadge'

export default function AnswerCard({ analysis, onRerun }) {
  return (
    <section
      aria-labelledby="answer-heading"
      className="rounded-xl border border-line bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="answer-heading"
          className="text-sm font-medium uppercase tracking-wide text-muted"
        >
          Answer
        </h2>
        <VerificationBadge status={analysis.status} />
      </div>

      <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">
        {analysis.answer.value}
      </p>
      <p className="mt-1 text-sm text-muted">{analysis.answer.label}</p>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed">{analysis.explanation}</p>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
        {/* These three are enabled in Phases 5 and 6 */}
        <Button variant="secondary" icon={ShieldCheck} disabled>
          View Proof
        </Button>
        <Button variant="secondary" icon={FileSearch} disabled>
          View Evidence
        </Button>
        <Button variant="secondary" icon={Code2} disabled>
          View Code
        </Button>
        <Button variant="secondary" icon={RotateCcw} onClick={onRerun}>
          Run Again
        </Button>
        <Button variant="secondary" icon={Download} disabled>
          Download Proof
        </Button>
      </div>
    </section>
  )
}