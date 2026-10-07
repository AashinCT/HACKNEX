import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { progressSteps } from '../../data/mockData'

export default function AnalysisProgress({ onComplete }) {
  // "current" is the index of the step being worked on
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= progressSteps.length) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setCurrent((c) => c + 1), 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <ol
      className="space-y-3 rounded-xl border border-line bg-canvas p-5"
      aria-live="polite"
    >
      {progressSteps.map((step, index) => {
        const done = index < current
        const active = index === current

        return (
          <li
            key={step}
            className={`flex items-center gap-3 text-sm ${
              done || active ? 'text-ink' : 'text-slate-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {done && <Check size={16} className="text-success" aria-hidden="true" />}
              {active && (
                <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
              )}
              {!done && !active && (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              )}
            </span>
            {step}
          </li>
        )
      })}
    </ol>
  )
}