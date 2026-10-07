import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Info } from 'lucide-react'
import Button from '../common/Button'
import ModeSelector from '../analysis/ModeSelector'
import QuestionInput from '../analysis/QuestionInput'
import AnalysisProgress from '../analysis/AnalysisProgress'
import { modes } from '../../data/mockData'
import { analyzeQuestion } from '../../services/api'

export default function AskData() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState('internal')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(false)
  // useRef keeps a value without causing a re-render
  const resultId = useRef(null)

  const selectedMode = modes.find((m) => m.id === mode)

  async function handleAnalyze(event) {
    event.preventDefault()
    if (!question.trim()) return
    setError(false)
    setRunning(true)
    try {
      const result = await analyzeQuestion({ question, mode })
      resultId.current = result.id
    } catch {
      setRunning(false)
      setError(true)
    }
  }

  // The progress display is a mock timer for now. With the real backend,
  // this should run when the backend reports the analysis is complete.
  function handleComplete() {
    setRunning(false)
    if (resultId.current) navigate(`/analyses/${resultId.current}`)
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

        {error && (
          <p role="alert" className="text-sm text-danger">
            Unable to start the analysis. Please try again.
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