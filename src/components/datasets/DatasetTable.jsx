import { Link } from 'react-router-dom'
import { FileSpreadsheet, FileJson, Eye, Trash2 } from 'lucide-react'
import DatasetStatus from './DatasetStatus'

function QualityScore({ score }) {
  const bar =
    score >= 95 ? 'bg-success' : score >= 85 ? 'bg-warning' : 'bg-danger'

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[13px] text-muted">{score}%</span>
    </div>
  )
}

export default function DatasetTable({ datasets, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 text-right font-medium">Rows</th>
            <th className="px-4 py-3 text-right font-medium">Columns</th>
            <th className="px-4 py-3 font-medium">Last updated</th>
            <th className="px-4 py-3 font-medium">Data quality</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {datasets.map((d) => {
            const FileIcon = d.type === 'JSON' ? FileJson : FileSpreadsheet

            return (
              <tr key={d.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3.5">
                  <Link
                    to={`/datasets/${d.id}`}
                    className="flex items-center gap-2.5 font-medium hover:text-accent"
                  >
                    <FileIcon size={16} className="text-muted" aria-hidden="true" />
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-muted">{d.type}</td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {d.rows.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {d.columns}
                </td>
                <td className="px-4 py-3.5 text-muted">{d.updated}</td>
                <td className="px-4 py-3.5">
                  <QualityScore score={d.qualityScore} />
                </td>
                <td className="px-4 py-3.5">
                  <DatasetStatus status={d.status} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/datasets/${d.id}`}
                      aria-label={`Open ${d.name}`}
                      className="rounded-md p-2 text-muted hover:bg-slate-100 hover:text-ink"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(d.id)}
                      aria-label={`Delete ${d.name}`}
                      className="rounded-md p-2 text-muted hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}