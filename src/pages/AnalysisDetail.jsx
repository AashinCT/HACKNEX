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
import CannotAnswer from '../components/analysis/CannotAnswer'
import { getAnalysis } from '../services/api'

export default function AnalysisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAnalysis(id).then((data) => { if (!cancelled) setAnalysis(data) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <LoadingState rows={3} />
  if (error || !analysis) return <ErrorState title="Unable to load analysis" message="This analysis could not be found."><Button onClick={() => navigate('/analyses')}>Back to analyses</Button></ErrorState>

  const verified = analysis.status === 'verified'
  const plan = analysis.proof?.analysis_plan || analysis.evidence?.plan || null
  const profile = analysis.proof?.data_profile
  const warnings = analysis.proof?.verifier_audit?.issues || []
  const explanation = analysis.proof?.analysis_plan?.reason || analysis.reason || 'The backend returned no additional explanation.'

  return (
    <div className="space-y-6">
      <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/analyses')}>All analyses</Button>
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          <ModeTag mode="internal" />
          <VerificationBadge status={verified ? 'verified' : 'cannot_answer'} />
          <span className="text-muted">{analysis.source || 'Uploaded dataset'}</span>
          {analysis.confidence != null && <span className="text-muted">Confidence: {Math.round(analysis.confidence * 100)}%</span>}
        </div>
        <h1 className="mt-3 text-[26px] font-semibold leading-snug tracking-tight">{analysis.question}</h1>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-muted"><Info size={14} />Backend-verified proof-carrying analysis</p>
      </section>

      {verified ? <AnswerCard analysis={analysis} explanation={explanation} /> : <CannotAnswer analysis={{ ...analysis, explanation }} />}

      {verified && profile && (
        <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Data reliability</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-canvas p-3"><p className="text-xs text-muted">Rows</p><p className="mt-1 font-semibold">{profile.rows}</p></div>
            <div className="rounded-lg bg-canvas p-3"><p className="text-xs text-muted">Columns</p><p className="mt-1 font-semibold">{profile.columns}</p></div>
            <div className="rounded-lg bg-canvas p-3"><p className="text-xs text-muted">Missing cells</p><p className="mt-1 font-semibold">{profile.missing_cells}</p></div>
            <div className="rounded-lg bg-canvas p-3"><p className="text-xs text-muted">Duplicate rows</p><p className="mt-1 font-semibold">{profile.duplicate_rows}</p></div>
          </div>
        </section>
      )}

      {warnings.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="flex items-center gap-2 text-sm font-semibold text-warning"><TriangleAlert size={16} />Verification issues</h2><ul className="mt-2 list-disc space-y-1 pl-6 text-sm">{warnings.map((w) => <li key={w}>{w}</li>)}</ul></section>}

      {plan && <AnalysisPlan plan={plan} />}

      {verified && analysis.proof?.trace?.events && (
        <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Execution trace</h2>
          <ol className="mt-4 space-y-2 text-sm">{analysis.proof.trace.events.map((event, index) => <li key={index} className="flex gap-3"><span className="font-mono text-muted">{index + 1}.</span><span><strong>{event.stage}</strong> — {event.status}</span></li>)}</ol>
        </section>
      )}
    </div>
  )
}
