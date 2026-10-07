import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function AnalysisPlan({ plan }) {
  const [open, setOpen] = useState(true)
  const rows = Array.isArray(plan)
    ? plan
    : Object.entries(plan || {}).map(([label, value]) => ({
        label: label.replaceAll('_', ' '),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—'),
      }))

  return (
    <section className="rounded-xl border border-line bg-white shadow-sm">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between px-6 py-4 text-left">
        <span><span className="block text-lg font-semibold tracking-tight">Analysis plan</span><span className="block text-[13px] text-muted">How the backend interpreted your question</span></span>
        <ChevronDown size={18} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <dl className="divide-y divide-line border-t border-line">{rows.map((row) => <div key={row.label} className="grid gap-1 px-6 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"><dt className="text-[13px] capitalize text-muted">{row.label}</dt><dd className="font-mono text-[13px] break-words">{row.value}</dd></div>)}</dl>}
    </section>
  )
}
