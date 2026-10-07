import { useRef, useState } from 'react'
import { UploadCloud, FileText, Check, Loader2, X } from 'lucide-react'
import Button from '../common/Button'
import ErrorState from '../common/ErrorState'
import { uploadDataset } from '../../services/api'

const SUPPORTED = ['csv', 'xlsx', 'xls', 'json', 'jsonl']

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ResultItem({ label, value }) {
  return <div className="rounded-lg border border-line bg-white p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{value}</p></div>
}

export default function UploadDataset({ onClose, onUploaded }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function reset() {
    setFile(null); setResult(null); setError(''); setPhase('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleFile(selected) {
    if (!selected) return
    const extension = selected.name.split('.').pop().toLowerCase()
    setFile(selected); setError('')
    if (!SUPPORTED.includes(extension)) {
      setPhase('error'); setError('Use CSV, XLSX, XLS, JSON, or JSONL.')
      return
    }
    setPhase('uploading')
    try {
      const uploaded = await uploadDataset(selected)
      setResult(uploaded); setPhase('done'); onUploaded?.(uploaded)
    } catch (err) {
      setError(err.message || 'Unable to upload dataset.'); setPhase('error')
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    handleFile(event.dataTransfer.files[0])
  }

  const extension = file ? file.name.split('.').pop().toUpperCase() : ''

  return (
    <section aria-labelledby="upload-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div><h2 id="upload-heading" className="text-lg font-semibold tracking-tight">Upload dataset</h2><p className="mt-1 text-sm text-muted">CSV, XLSX, XLS, JSON, or JSONL</p></div>
        <button type="button" onClick={onClose} aria-label="Close upload panel" className="rounded-md p-1.5 text-muted hover:bg-slate-100"><X size={18} /></button>
      </div>
      <div className="mt-5">
        {phase === 'idle' && (
          <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="flex flex-col items-center rounded-xl border-2 border-dashed border-line bg-canvas px-6 py-10 text-center">
            <UploadCloud size={28} className="text-muted" /><p className="mt-3 text-base font-medium">Drop your dataset here</p><p className="mt-1 text-sm text-muted">or choose a file from your computer</p>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.json,.jsonl" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <Button type="button" variant="secondary" className="mt-4" onClick={() => inputRef.current?.click()}>Choose file</Button>
          </div>
        )}
        {phase === 'error' && <ErrorState title="Unable to upload dataset" message={error}><Button onClick={reset}>Try again</Button><Button variant="secondary" onClick={onClose}>Back to datasets</Button></ErrorState>}
        {(phase === 'uploading' || phase === 'done') && file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-4">
              <FileText size={20} className="shrink-0 text-muted" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted">{extension}, {formatSize(file.size)}</p></div>
              <span className="flex items-center gap-1.5 text-[13px] text-muted">
                {phase === 'uploading' ? <><Loader2 size={14} className="animate-spin" />Uploading...</> : <><Check size={14} className="text-success" />Uploaded</>}
              </span>
            </div>
            {result && <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ResultItem label="Rows" value={result.rows.toLocaleString()} />
                <ResultItem label="Columns" value={result.columns} />
                <ResultItem label="Missing cells" value={result.profile?.missing_cells ?? 0} />
                <ResultItem label="Duplicate rows" value={result.profile?.duplicate_rows ?? 0} />
              </div>
              <div className="flex justify-end gap-3"><Button variant="secondary" onClick={reset}>Upload another</Button><Button onClick={onClose}>Done</Button></div>
            </>}
          </div>
        )}
      </div>
    </section>
  )
}
