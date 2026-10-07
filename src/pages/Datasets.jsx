import { useState } from 'react'
import { Upload, Search, Database } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import UploadDataset from '../components/datasets/UploadDataset'
import DatasetTable from '../components/datasets/DatasetTable'
import { datasets as initialDatasets } from '../data/mockData'

export default function Datasets() {
  const [items, setItems] = useState(initialDatasets)
  const [query, setQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const filtered = items.filter((d) =>
    d.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  function handleDelete(id) {
    // Mock only. Later this will call the backend.
    setItems((current) => current.filter((d) => d.id !== id))
  }

  return (
    <>
      <PageHeader
        title="Datasets"
        subtitle="Manage the data available for internal analysis."
        action={
          <Button icon={Upload} onClick={() => setShowUpload(true)}>
            Upload dataset
          </Button>
        }
      />

      <div className="space-y-6">
        {showUpload && <UploadDataset onClose={() => setShowUpload(false)} />}

        {items.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No datasets yet"
            description="Upload a dataset to begin your first internal analysis."
          >
            <Button icon={Upload} onClick={() => setShowUpload(true)}>
              Upload dataset
            </Button>
          </EmptyState>
        ) : (
          <>
            <div className="relative max-w-sm">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <label htmlFor="dataset-search" className="sr-only">
                Search datasets
              </label>
              <input
                id="dataset-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search datasets"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching datasets"
                description="Try a different search term."
              />
            ) : (
              <DatasetTable datasets={filtered} onDelete={handleDelete} />
            )}
          </>
        )}
      </div>
    </>
  )
}