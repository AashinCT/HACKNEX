export default function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className = 'rounded-xl border border-line bg-white',
}) {
  return (
    <div
      className={`flex flex-col items-center px-6 py-12 text-center ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-muted">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}