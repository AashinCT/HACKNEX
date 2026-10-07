import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lightbulb, TriangleAlert, Info } from 'lucide-react'
import Button from '../components/common/Button'
import ErrorState from '../components/common/ErrorState'
import LoadingState from '../components/common/LoadingState'
import ModeTag from '../components/analysis/ModeTag'
import VerificationBadge from '../components/analysis/VerificationBadge'
import AnswerCard from '../components/analysis/AnswerCard'
import AnalysisPlan from '../components/analysis/AnalysisPlan'
import AnalysisProgress from '../components/analysis/AnalysisProgress'
import CannotAnswer from '../components/analysis/CannotAnswer'
import { getAnalysis } from '../services/api'
import { modes } from '../data/mockData'

export default function AnalysisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [rerunning, setRerunning] = useState(false)

  // Runs whenever the id in the URL changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    getAnalysis(id)
      .then((data) => {
        if (!cancelled) setAnalysis(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LoadingState rows={3} />

  if (error || !analysis) {
    return (
      <ErrorState
        title="Unable to load analysis"
        message="This analysis could not be found. It may have been removed."
      >
        <Button onClick={() => navigate('/analyses')}>Back to analyses</Button>
      </ErrorState>
    )
  }

  const notice = modes.find((m) => m.id === analysis.mode)?.notice

  return (
    <div className="space-y-6">
      <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/analyses')}>
        All analyses
      </Button>

      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          <ModeTag mode={analysis.mode} />
          <VerificationBadge status={analysis.status} />
          <span className="text-muted">{analysis.date}</span>
          <span className="text-muted">
            {analysis.sourceCount} {analysis.sourceCount === 1 ? 'source' : 'sources'}
          </span>
        </div>
        <h1 className="mt-3 text-[26px] font-semibold leading-snug tracking-tight">
          {analysis.question}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-muted">
          <Info size={14} aria-hidden="true" />
          {notice}
        </p>
      </section>

      {rerunning ? (
        <AnalysisProgress onComplete={() => setRerunning(false)} />
      ) : analysis.status === 'cannot_answer' ? (
        <CannotAnswer analysis={analysis} />
      ) : (
        <>
          <AnswerCard analysis={analysis} onRerun={() => setRerunning(true)} />

          {analysis.insight && (
            <section className="flex items-start gap-3 rounded-xl border border-line bg-white p-5 shadow-sm">
              <Lightbulb size={18} className="mt-0.5 text-accent" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold">Key insight</h2>
                <p className="mt-1 text-sm">{analysis.insight}</p>
              </div>
            </section>
          )}

          {analysis.warnings.length > 0 && (
            <section
              aria-labelledby="warnings-heading"
              className="rounded-xl border border-amber-200 bg-amber-50 p-5"
            >
              <h2
                id="warnings-heading"
                className="flex items-center gap-2 text-sm font-semibold text-warning"
              >
                <TriangleAlert size={16} aria-hidden="true" />
                Warnings and limitations
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                {analysis.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {!rerunning && <AnalysisPlan plan={analysis.plan} />}

      <p className="text-[13px] text-muted">
        Charts, evidence, generated code, and the proof report are added in the
        next phases.
      </p>
    </div>
  )
}