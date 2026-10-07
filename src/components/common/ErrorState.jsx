import { TriangleAlert } from 'lucide-react'

export default function ErrorState({
  title,
  message,
  children,
  className = 'rounded-xl border border-line bg-white',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center px-6 py-12 text-center ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-danger">
        <TriangleAlert size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      {children && (
        <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>
      )}
    </div>
  )
}