// Temporary data for frontend development.
// Replace with responses from the FastAPI backend later (see src/services/api.js).

// ---------- Dashboard (Phase 2) ----------

export const stats = [
  { id: 'datasets', label: 'Datasets', value: '12', description: 'Uploaded datasets' },
  { id: 'analyses', label: 'Analyses', value: '28', description: 'Total analyses' },
  { id: 'verified', label: 'Verified results', value: '94%', description: 'Results successfully verified' },
  { id: 'evidence', label: 'Evidence sources', value: '146', description: 'Evidence items collected' },
]

export const modes = [
  {
    id: 'internal',
    label: 'Internal',
    description: 'Analyze only your uploaded data.',
    notice: 'Analysis uses only your uploaded data.',
  },
  {
    id: 'external',
    label: 'External',
    description: 'Use public internet and market information.',
    notice: 'Analysis uses publicly available external sources.',
  },
  {
    id: 'blend',
    label: 'Blend',
    description: 'Combine internal data with external intelligence.',
    notice: 'Analysis combines uploaded data with external sources.',
  },
]

export const exampleQuestions = [
  'What was our average revenue in Chennai during 2025?',
  'How did our sales change over the last 12 months?',
  'Compare our growth with our competitors.',
  'What products generated the most revenue?',
]

// status values: 'verified' | 'warnings' | 'unverified' | 'cannot_answer'
export const recentAnalyses = [
  {
    id: 'a-101',
    question: 'Average revenue in Chennai during 2025',
    mode: 'internal',
    status: 'verified',
    date: 'Today',
  },
  {
    id: 'a-100',
    question: 'Compare revenue growth with competitors',
    mode: 'blend',
    status: 'warnings',
    date: 'Yesterday',
  },
  {
    id: 'a-099',
    question: 'Top companies in our industry',
    mode: 'external',
    status: 'verified',
    date: 'Yesterday',
  },
]

// Steps shown while an analysis is running
export const progressSteps = [
  'Understanding your question...',
  'Checking available data...',
  'Generating analysis...',
  'Running verification...',
  'Preparing evidence...',
  'Finalizing result...',
]

// ---------- Datasets (Phase 3) ----------

// status values: 'verified' | 'warning' | 'error'
export const datasets = [
  { id: 'd-1', name: 'sales_2025.csv', type: 'CSV', rows: 24582, columns: 12, updated: 'Updated 2 hours ago', qualityScore: 98, status: 'verified' },
  { id: 'd-2', name: 'customers.xlsx', type: 'Excel', rows: 5421, columns: 8, updated: 'Updated yesterday', qualityScore: 86, status: 'warning', sheet: 'Customers' },
  { id: 'd-3', name: 'products.csv', type: 'CSV', rows: 312, columns: 9, updated: 'Updated 3 days ago', qualityScore: 99, status: 'verified' },
  { id: 'd-4', name: 'regional_targets.json', type: 'JSON', rows: 96, columns: 6, updated: 'Updated 1 week ago', qualityScore: 94, status: 'verified' },
]

// level values: 'good' | 'warning' | 'problem'
export const dataQualityById = {
  'd-1': {
    status: 'verified',
    rows: 24582,
    columns: 12,
    checks: [
      { id: 'missing', label: 'Missing values', value: '2.1%', level: 'good' },
      { id: 'duplicates', label: 'Duplicate rows', value: '0.3%', level: 'good' },
      { id: 'dates', label: 'Invalid dates', value: '0', level: 'good' },
      { id: 'values', label: 'Invalid values', value: '0', level: 'good' },
      { id: 'ids', label: 'Unmatched IDs', value: '12', level: 'warning' },
      { id: 'relations', label: 'Relationship issues', value: 'None detected', level: 'good' },
    ],
  },
  'd-2': {
    status: 'warning',
    rows: 5421,
    columns: 8,
    checks: [
      { id: 'missing', label: 'Missing values', value: '9.8%', level: 'warning' },
      { id: 'duplicates', label: 'Duplicate rows', value: '1.2%', level: 'warning' },
      { id: 'dates', label: 'Invalid dates', value: '4', level: 'warning' },
      { id: 'values', label: 'Invalid values', value: '0', level: 'good' },
      { id: 'ids', label: 'Unmatched IDs', value: '37', level: 'problem' },
      { id: 'relations', label: 'Relationship issues', value: 'Possible duplicate keys', level: 'warning' },
    ],
  },
}

// Shown after a mock upload finishes processing
export const uploadResultMock = {
  rows: '8,240',
  columns: '10',
  missing: '1.4%',
  duplicates: '0.2%',
  status: 'verified',
}

// Mock preview rows (the same sample is used for every dataset for now)
export const previewColumns = [
  { key: 'customer_id', label: 'customer_id', type: 'text' },
  { key: 'city', label: 'city', type: 'text' },
  { key: 'revenue', label: 'revenue', type: 'currency' },
   { key: 'date', label: 'date', type: 'date' },
  { key: 'product', label: 'product', type: 'text' },
]

const previewCities = ['Chennai', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune']
const previewProducts = ['Analytics Suite', 'Data Connector', 'Reporting Add-on', 'Support Plan']

// null means the value is missing
export const previewRows = Array.from({ length: 48 }, (_, i) => ({
  customer_id: `C${1000 + (i + 1) * 7}`,
  city: i % 11 === 5 ? null : previewCities[i % previewCities.length],
  revenue: i % 17 === 8 ? null : 20000 + ((i * 7919) % 90000),
  date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  product: previewProducts[(i * 3) % previewProducts.length],
}))