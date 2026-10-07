const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const message = typeof body === 'object' && (body?.detail || body?.reason)
      ? body.detail || body.reason
      : `Request failed with status ${response.status}`
    throw new Error(message)
  }
  return body
}

export async function getDatasets() {
  return JSON.parse(localStorage.getItem('hacknex.datasets') || '[]')
}

export async function uploadDataset(file) {
  const body = new FormData()
  body.append('file', file)
  const result = await request('/api/upload', { method: 'POST', body })
  const profile = result.profile || {}
  const dataset = {
    id: result.dataset,
    backendPath: result.dataset,
    name: result.original_filename || file.name,
    type: file.name.split('.').pop().toUpperCase(),
    rows: profile.rows || 0,
    columns: profile.columns || 0,
    updated: 'Just now',
    qualityScore: profile.reliability_flags?.length ? 80 : 100,
    status: profile.reliability_flags?.length ? 'warning' : 'verified',
    profile,
    schema: result.schema,
  }
  const current = JSON.parse(localStorage.getItem('hacknex.datasets') || '[]')
  localStorage.setItem('hacknex.datasets', JSON.stringify([dataset, ...current]))
  return dataset
}

export async function analyzeQuestion({ question, dataset, session_id = 'frontend-demo' }) {
  return request('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, dataset, session_id }),
  })
}

export async function getAnalysis(id) {
  const saved = sessionStorage.getItem(`hacknex.analysis.${id}`)
  if (!saved) throw new Error('Analysis not found')
  return JSON.parse(saved)
}

export async function saveAnalysis(id, analysis) {
  sessionStorage.setItem(`hacknex.analysis.${id}`, JSON.stringify(analysis))
  const ids = JSON.parse(sessionStorage.getItem('hacknex.analysis.ids') || '[]')
  if (!ids.includes(id)) {
    ids.unshift(id)
    sessionStorage.setItem('hacknex.analysis.ids', JSON.stringify(ids.slice(0, 50)))
  }
  return analysis
}

export async function getAnalyses() {
  const ids = JSON.parse(sessionStorage.getItem('hacknex.analysis.ids') || '[]')
  return ids.map((id) => {
    const raw = sessionStorage.getItem(`hacknex.analysis.${id}`)
    return raw ? JSON.parse(raw) : null
  }).filter(Boolean).map((a) => ({
    id: a.id,
    question: a.question,
    mode: 'internal',
    status: a.status === 'verified' ? 'verified' : a.status === 'refused' ? 'cannot_answer' : a.status,
    date: 'Just now',
    result: a.answer ?? 'No result',
    sourceCount: a.evidence_rows?.row_count || 0,
  }))
}

export async function getEvidence(id) {
  const analysis = await getAnalysis(id)
  return analysis.evidence_rows || analysis.proof?.evidence_rows || null
}

export async function getProof(id) {
  const analysis = await getAnalysis(id)
  return analysis.proof || null
}

export async function downloadProof(id) {
  const proof = await getProof(id)
  return proof ? new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' }) : null
}

export function makeAnalysisId() {
  return `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
