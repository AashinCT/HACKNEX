import { CircleCheck, TriangleAlert, CircleX } from 'lucide-react'
import DatasetStatus from './DatasetStatus'

const levels = {
  good: { icon: CircleCheck, style: 'text-success', label: 'Good' },
  warning: { icon: TriangleAlert, style: 'text-warning', label: 'Warning' },
  problem: { icon: CircleX, style: 'text-danger', label: 'Problem' },
}

export default function DataQuality({ quality }) {
  return (
    <section
      aria-labelledby="quality-heading"
      className="rounded-xl border border-line bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 id="quality-heading" className="text-lg font-semibold tracking-tight">
          Data Quality
        </h2>
        <DatasetStatus status={quality.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-canvas p-3">
          <p className="text-xs text-muted">Rows</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {quality.rows.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-canvas p-3">
          <p className="text-xs text-muted">Columns</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{quality.columns}</p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-line">
        {quality.checks.map((check) => {
          const level = levels[check.level]
          const Icon = level.icon

          return (
            <div
              key={check.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <dt className="flex items-center gap-2 text-sm">
                <Icon size={15} className={level.style} aria-hidden="true" />
                {check.label}
                <span className="sr-only">: {level.label}</span>
              </dt>
              <dd className="text-sm font-medium tabular-nums">{check.value}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}