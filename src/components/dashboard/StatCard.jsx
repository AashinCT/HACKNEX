export default function StatCard({ label, value, description, icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <Icon size={18} className="text-muted" aria-hidden="true" />
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-2 text-[13px] text-muted">{description}</p>
    </div>
  )
}