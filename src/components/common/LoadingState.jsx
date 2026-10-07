export default function LoadingState({ rows = 3 }) {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl border border-line bg-white"
        />
      ))}
    </div>
  )
}