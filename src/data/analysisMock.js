// Mock analysis results for frontend development.
// status values: 'verified' | 'warnings' | 'unverified' | 'cannot_answer'

export const analysisDetails = {
  'a-101': {
    id: 'a-101',
    question: 'What was our average revenue from customers in Chennai during 2025?',
    mode: 'internal',
    status: 'verified',
    date: 'Today',
    sourceCount: 2,
    answer: { value: '₹84,523', label: 'Average revenue per Chennai customer, 2025' },
    insight: 'Average revenue increased 12.4% compared with 2024.',
    explanation:
      'Calculated from 8,873 transactions made by customers located in Chennai between 1 January and 31 December 2025.',
    warnings: [],
    plan: [
      { label: 'Tables', value: 'sales, customers' },
      { label: 'Join', value: 'sales.customer_id = customers.customer_id' },
      { label: 'Filters', value: 'city = Chennai, year = 2025' },
      { label: 'Operation', value: 'Mean' },
      { label: 'Column', value: 'revenue' },
    ],
  },

  'a-100': {
    id: 'a-100',
    question: 'Compare our company revenue growth with our top competitors.',
    mode: 'blend',
    status: 'warnings',
    date: 'Yesterday',
    sourceCount: 5,
    answer: { value: '-4 pts', label: 'Our growth versus industry growth' },
    insight: 'Our growth was 11%, while industry growth was 15%.',
    explanation:
      'Internal growth was calculated from uploaded sales data. Industry growth comes from public external sources and was compared with the internal figure.',
    warnings: [
      'Some competitor figures use a different fiscal year end than your data.',
      'One external source could not be independently confirmed.',
    ],
    plan: [
      { label: 'Internal data', value: 'sales_2025.csv' },
      { label: 'External sources', value: 'Industry report, competitor annual reports' },
      { label: 'Metric', value: 'Year-over-year revenue growth' },
      { label: 'Operation', value: 'Difference in percentage points' },
    ],
  },

  'a-099': {
    id: 'a-099',
    question: 'Who are the top companies in our industry?',
    mode: 'external',
    status: 'verified',
    date: 'Yesterday',
    sourceCount: 4,
    answer: { value: '5 companies', label: 'Top companies identified by revenue' },
    insight: 'The top three companies account for roughly 60% of reported industry revenue.',
    explanation:
      'Companies were ranked by publicly reported revenue. All figures come from external sources and none come from your uploaded data.',
    warnings: [],
    plan: [
      { label: 'Sources', value: 'Public filings, industry reports' },
      { label: 'Metric', value: 'Reported annual revenue' },
      { label: 'Operation', value: 'Rank and compare' },
    ],
  },

  'a-098': {
    id: 'a-098',
    question: 'What was our profit in 2025?',
    mode: 'internal',
    status: 'cannot_answer',
    date: '3 days ago',
    sourceCount: 1,
    answer: null,
    insight: null,
    explanation: 'Required information is not available in the provided data.',
    warnings: [],
    missing: {
      required: ['Cost data'],
      available: ['Revenue', 'Quantity', 'Selling price'],
    },
    plan: [
      { label: 'Tables', value: 'sales' },
      { label: 'Operation', value: 'Revenue minus cost' },
      { label: 'Blocked by', value: 'No cost column found' },
    ],
  },
}

// The list view only needs the summary fields
export const analysisList = Object.values(analysisDetails).map((a) => ({
  id: a.id,
  question: a.question,
  mode: a.mode,
  status: a.status,
  date: a.date,
  result: a.answer ? a.answer.value : 'No result',
  sourceCount: a.sourceCount,
}))