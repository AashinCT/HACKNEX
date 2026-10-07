import { useState } from 'react'
import { BarChart3, Info } from 'lucide-react'
import Button from '../common/Button'
import ModeSelector from '../analysis/ModeSelector'
import QuestionInput from '../analysis/QuestionInput'
import AnalysisProgress from '../analysis/AnalysisProgress'
import { modes } from '../../data/mockData'

export default function AskData() {
  // useState remembers values between renders
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState('internal')
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const selectedMode = modes.find((m) => m.id === mode)

  function handleAnalyze(event) {
    event.preventDefault()
    if (!question.trim()) return
    setFinished(false)
    setRunning(true)
    // Later: call analyzeQuestion({ question, mode }) from services/api.js here
  }

  function handleComplete() {
    setRunning(false)
    setFinished(true)
  }

  return (
    <section
      aria-labelledby="ask-heading"
      className="rounded-xl border border-line bg-white p-6 shadow-sm"
    >
      <h2 id="ask-heading" className="text-xl font-semibold tracking-tight">
        Ask your data
      </h2>
      <p className="mt-1 text-sm text-muted">
        Ask a question and choose how you want the analysis performed.
      </p>

      <form onSubmit={handleAnalyze} className="mt-5 space-y-5">
        <QuestionInput value={question} onChange={setQuestion} disabled={running} />

        <ModeSelector value={mode} onChange={setMode} disabled={running} />

        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Info size={14} aria-hidden="true" />
          {selectedMode.notice}
        </p>

        {running && <AnalysisProgress onComplete={handleComplete} />}

        {finished && (
          <p className="rounded-xl border border-line bg-canvas p-4 text-sm text-muted">
            Mock analysis finished. The full results view is built in Phase 4.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            icon={BarChart3}
            loading={running}
            disabled={!question.trim()}
          >
            {running ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </form>
    </section>
  )
}