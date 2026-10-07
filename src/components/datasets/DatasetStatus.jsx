import { BadgeCheck, TriangleAlert, CircleAlert } from 'lucide-react'
import Badge from '../common/Badge'

const config = {
  verified: { label: 'Verified', tone: 'success', icon: BadgeCheck },
  warning: { label: 'Warning', tone: 'warning', icon: TriangleAlert },
  error: { label: 'Error', tone: 'danger', icon: CircleAlert },
}

export default function DatasetStatus({ status }) {
  const { label, tone, icon } = config[status] ?? config.error
  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  )
}