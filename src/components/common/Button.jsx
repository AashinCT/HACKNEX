import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-accent text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300',
  secondary:
    'border border-line bg-white text-ink hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400',
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={16} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}