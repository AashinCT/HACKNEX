import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Info } from 'lucide-react'
import Button from '../common/Button'
import ModeSelector from '../analysis/ModeSelector'
import QuestionInput from '../analysis/QuestionInput'
import AnalysisProgress from '../analysis/AnalysisProgress'
import { modes } from '../../data/mockData'
import { analyzeQuestion, getDatasets, makeAnalysisId, saveAnalysis } from '../../services/api'

export default function AskData() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState('internal')
  const [dataset, setDataset] = useState('')
  const [datasets, setDatasets] = useState([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const selectedMode = modes.find((m) => m.id === mode)

  useEffect(() => {
    getDatasets().then((items) => {
      setDatasets(items)
      if (items[0]) setDataset(items[0].backendPath || items[0].id)
    }).catch(() => {})
  }, [])

  async function handleAnalyze(event) {
    event.preventDefault()
    if (!question.trim() || !dataset) return
    setError('')
    setRunning(true)
    try {
      const result = await analyzeQuestion({ question: question.trim(), dataset, session_id: 'frontend-demo' })
      const id = makeAnalysisId()
      await saveAnalysis(id, { ...result, id })
      navigate(`/analyses/${id}`)
    } catch (err) {
      setError(err.message || 'Unable to run the analysis.')
      setRunning(false)
    }
  }

  return (
    <section aria-labelledby="ask-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <h2 id="ask-heading" className="text-xl font-semibold tracking-tight">Ask your data</h2>
      <p className="mt-1 text-sm text-muted">Ask a question about an uploaded dataset. Every numerical answer is executed and verified.</p>
      <form onSubmit={handleAnalyze} className="mt-5 space-y-5">
        <QuestionInput value={question} onChange={setQuestion} disabled={running} />
        <label className="block">
          <span className="text-sm font-medium">Dataset</span>
          <select value={dataset} onChange={(e) => setDataset(e.target.value)} disabled={running}
            className="mt-2 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-accent focus:outline-none">
            <option value="">Select a dataset</option>
            {datasets.map((item) => <option key={item.id} value={item.backendPath || item.id}>{item.name}</option>)}
          </select>
        </label>
        <ModeSelector value={mode} onChange={setMode} disabled={running} />
        <p className="flex items-center gap-2 text-[13px] text-muted"><Info size={14} aria-hidden="true" />{selectedMode.notice}</p>
        {running && <AnalysisProgress onComplete={() => {}} />}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" icon={BarChart3} loading={running} disabled={!question.trim() || !dataset}>
            {running ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </form>
    </section>
  )
}
