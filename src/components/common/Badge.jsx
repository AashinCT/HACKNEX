const tones = {
  success: 'border-green-200 bg-green-50 text-success',
  warning: 'border-amber-200 bg-amber-50 text-warning',
  danger: 'border-red-200 bg-red-50 text-danger',
  neutral: 'border-line bg-slate-50 text-muted',
}

export default function Badge({ tone = 'neutral', icon: Icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {Icon && <Icon size={13} aria-hidden="true" />}
      {children}
    </span>
  )
}