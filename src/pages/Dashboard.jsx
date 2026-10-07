import { Database, BarChart3, BadgeCheck, FileSearch } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/dashboard/StatCard'
import AskData from '../components/dashboard/AskData'
import RecentAnalyses from '../components/dashboard/RecentAnalyses'
import { stats } from '../data/mockData'

// Maps each stat id to its icon
const statIcons = {
  datasets: Database,
  analyses: BarChart3,
  verified: BadgeCheck,
  evidence: FileSearch,
}

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Analyze your data, compare external intelligence, and trace every result."
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} icon={statIcons[stat.id]} />
          ))}
        </div>

        <AskData />
        <RecentAnalyses />
      </div>
    </>
  )
}