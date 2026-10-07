import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import ErrorState from '../components/common/ErrorState'
import DatasetPreview from '../components/datasets/DatasetPreview'
import DataQuality from '../components/datasets/DataQuality'
import {
  datasets,
  dataQualityById,
  previewColumns,
  previewRows,
} from '../data/mockData'

export default function DatasetDetail() {
  // useParams reads the :id part of the URL, e.g. /datasets/d-1
  const { id } = useParams()
  const navigate = useNavigate()
  const dataset = datasets.find((d) => d.id === id)

  if (!dataset) {
    return (
      <ErrorState
        title="Unable to load dataset"
        message="This dataset could not be found. It may have been removed."
      >
        <Button onClick={() => navigate('/datasets')}>Back to datasets</Button>
      </ErrorState>
    )
  }

  const quality = dataQualityById[id] ?? dataQualityById['d-1']
  const sheetNote = dataset.sheet ? `, sheet "${dataset.sheet}"` : ''

  return (
    <>
      <PageHeader
        title={dataset.name}
        subtitle={`${dataset.type}, ${dataset.rows.toLocaleString()} rows, ${dataset.columns} columns${sheetNote}`}
        action={
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/datasets')}
          >
            All datasets
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <DatasetPreview columns={previewColumns} rows={previewRows} />
        </div>
        <DataQuality quality={quality} />
      </div>
    </>
  )
}