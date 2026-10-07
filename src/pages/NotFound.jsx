import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        subtitle="The page you are looking for does not exist."
      />
      <Link to="/dashboard" className="text-sm font-medium text-accent hover:underline">
        Back to dashboard
      </Link>
    </>
  )
}