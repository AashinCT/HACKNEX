import { BadgeCheck, TriangleAlert, CircleAlert, CircleX } from 'lucide-react'

const statusConfig = {
  verified: {
    label: 'Verified',
    icon: BadgeCheck,
    style: 'border-green-200 bg-green-50 text-success',
  },
  warnings: {
    label: 'Verified with warnings',
    icon: TriangleAlert,
    style: 'border-amber-200 bg-amber-50 text-warning',
  },
  unverified: {
    label: 'Unable to verify',
    icon: CircleAlert,
    style: 'border-red-200 bg-red-50 text-danger',
  },
  cannot_answer: {
    label: 'Cannot answer reliably',
    icon: CircleX,
    style: 'border-red-200 bg-red-50 text-danger',
  },
}

export default function VerificationBadge({ status }) {
  const config = statusConfig[status] ?? statusConfig.unverified
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.style}`}
    >
      <Icon size={13} aria-hidden="true" />
      {config.label}
    </span>
  )
}