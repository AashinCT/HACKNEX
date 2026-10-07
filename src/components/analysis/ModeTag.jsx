import { modes } from '../../data/mockData'
import { modeIcons } from './ModeSelector'

export default function ModeTag({ mode }) {
  const Icon = modeIcons[mode]
  const label = modes.find((m) => m.id === mode)?.label

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  )
}