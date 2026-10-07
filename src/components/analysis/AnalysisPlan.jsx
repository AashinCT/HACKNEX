import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function AnalysisPlan({ plan }) {
  const [open, setOpen] = useState(true)

  return (
    <section className="rounded-xl border border-line bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="analysis-plan-body"
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span>
          <span className="block text-lg font-semibold tracking-tight">
            Analysis plan
          </span>
          <span className="block text-[13px] text-muted">
            How your question was interpreted
          </span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <dl id="analysis-plan-body" className="divide-y divide-line border-t border-line">
          {plan.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 px-6 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <dt className="text-[13px] text-muted">{row.label}</dt>
              <dd className="font-mono text-[13px]">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}