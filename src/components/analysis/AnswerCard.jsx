import { ShieldCheck, FileSearch, Code2, Download } from 'lucide-react'
import Button from '../common/Button'
import VerificationBadge from './VerificationBadge'
import { downloadProof } from '../../services/api'

export default function AnswerCard({ analysis, explanation }) {
  const answer = analysis.answer
  const metric = analysis.metric_value
  const evidence = analysis.evidence_rows?.rows || []
  const code = analysis.generated_code || ''

  async function handleDownload() {
    const blob = await downloadProof(analysis.id)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'proof.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section aria-labelledby="answer-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 id="answer-heading" className="text-sm font-medium uppercase tracking-wide text-muted">Verified answer</h2>
        <VerificationBadge status="verified" />
      </div>

      <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">{String(answer)}</p>
      {metric != null && <p className="mt-1 text-lg font-medium text-accent tabular-nums">Metric: {Number(metric).toLocaleString('en-IN')}</p>}
      <p className="mt-4 max-w-2xl text-sm leading-relaxed">{explanation}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-canvas p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={16} />Verification</h3>
          <p className="mt-2 text-sm">Executed result: <strong>{String(analysis.executed_result)}</strong></p>
          <p className="mt-1 text-sm">Confidence: <strong>{Math.round((analysis.confidence || 0) * 100)}%</strong></p>
        </div>
        <div className="rounded-lg border border-line bg-canvas p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><FileSearch size={16} />Evidence</h3>
          <p className="mt-2 text-sm">{evidence.length} supporting row{evidence.length === 1 ? '' : 's'} returned by the backend.</p>
        </div>
        <div className="rounded-lg border border-line bg-canvas p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Code2 size={16} />Generated analysis</h3>
          <p className="mt-2 text-sm">Executable Python/Pandas code was run against the dataset.</p>
        </div>
      </div>

      {code && <pre className="mt-5 max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100"><code>{code}</code></pre>}

      {evidence.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-slate-50"><tr>{Object.keys(evidence[0]).map((key) => <th key={key} className="px-3 py-2 font-medium">{key}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">{evidence.map((row, i) => <tr key={i}>{Object.keys(evidence[0]).map((key) => <td key={key} className="px-3 py-2">{String(row[key] ?? '')}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end border-t border-line pt-5">
        <Button variant="secondary" icon={Download} onClick={handleDownload}>Download Proof</Button>
      </div>
    </section>
  )
}
