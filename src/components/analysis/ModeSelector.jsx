import { Database, Globe, GitCompare } from 'lucide-react'
import { modes } from '../../data/mockData'

// Shared so other components can show the same icon for each mode
export const modeIcons = {
  internal: Database,
  external: Globe,
  blend: GitCompare,
}

export default function ModeSelector({ value, onChange, disabled = false }) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">Analysis mode</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {modes.map((mode) => {
          const Icon = modeIcons[mode.id]
          const selected = value === mode.id

          return (
            <label
              key={mode.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                selected
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="analysis-mode"
                value={mode.id}
                checked={selected}
                onChange={() => onChange(mode.id)}
                className="sr-only"
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  selected ? 'bg-accent text-white' : 'bg-slate-100 text-muted'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{mode.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                  {mode.description}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}