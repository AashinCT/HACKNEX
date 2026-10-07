import { useEffect, useRef, useState } from 'react'
import { UploadCloud, FileText, Check, Loader2, X } from 'lucide-react'
import Button from '../common/Button'
import ErrorState from '../common/ErrorState'
import DatasetStatus from './DatasetStatus'
import { uploadResultMock } from '../../data/mockData'

const SUPPORTED = ['csv', 'xlsx', 'xls', 'json']

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ResultItem({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export default function UploadDataset({ onClose }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  // phase: 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  const [phase, setPhase] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  // Simulated upload progress
  useEffect(() => {
    if (phase !== 'uploading') return
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 100))
    }, 200)
    return () => clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase === 'uploading' && progress >= 100) setPhase('processing')
  }, [phase, progress])

  // Simulated processing
  useEffect(() => {
    if (phase !== 'processing') return
    const timer = setTimeout(() => setPhase('done'), 1200)
    return () => clearTimeout(timer)
  }, [phase])

  function reset() {
    setFile(null)
    setPhase('idle')
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleFile(selected) {
    if (!selected) return
    const extension = selected.name.split('.').pop().toLowerCase()
    setFile(selected)
    setProgress(0)
    if (!SUPPORTED.includes(extension)) {
      setPhase('error')
      return
    }
    setPhase('uploading')
    // Later: call uploadDataset(selected) from services/api.js here
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const extension = file ? file.name.split('.').pop().toUpperCase() : ''

  return (
    <section
      aria-labelledby="upload-heading"
      className="rounded-xl border border-line bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 id="upload-heading" className="text-lg font-semibold tracking-tight">
            Upload dataset
          </h2>
          <p className="mt-1 text-sm text-muted">
            Supported formats: CSV, XLSX, XLS, JSON
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close upload panel"
          className="rounded-md p-1.5 text-muted hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5">
        {phase === 'idle' && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging ? 'border-accent bg-accent-soft' : 'border-line bg-canvas'
            }`}
          >
            <UploadCloud size={28} className="text-muted" aria-hidden="true" />
            <p className="mt-3 text-base font-medium">Drop your dataset here</p>
            <p className="mt-1 text-sm text-muted">
              or choose a file from your computer
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              className="hidden"
              aria-label="Choose dataset file"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              Choose file
            </Button>
          </div>
        )}

        {phase === 'error' && (
          <ErrorState
            className=""
            title="Unable to process dataset"
            message="This file type is not supported. Use a CSV, XLSX, XLS, or JSON file."
          >
            <Button onClick={reset}>Try again</Button>
            <Button variant="secondary" onClick={onClose}>
              Back to datasets
            </Button>
          </ErrorState>
        )}

        {(phase === 'uploading' || phase === 'processing' || phase === 'done') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-4">
              <FileText size={20} className="shrink-0 text-muted" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted">
                  {extension}, {formatSize(file.size)}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[13px] text-muted">
                {phase === 'uploading' && `Uploading ${progress}%`}
                {phase === 'processing' && (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Processing file...
                  </>
                )}
                {phase === 'done' && (
                  <>
                    <Check size={14} className="text-success" aria-hidden="true" />
                    Processing complete
                  </>
                )}
              </span>
            </div>

            {phase !== 'done' && (
              <div
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="h-2 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {phase === 'done' && (
              <>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">Data quality</p>
                  <DatasetStatus status={uploadResultMock.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <ResultItem label="Rows" value={uploadResultMock.rows} />
                  <ResultItem label="Columns" value={uploadResultMock.columns} />
                  <ResultItem label="Missing values" value={uploadResultMock.missing} />
                  <ResultItem label="Duplicates" value={uploadResultMock.duplicates} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={reset}>
                    Upload another
                  </Button>
                  <Button onClick={onClose}>Done</Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}