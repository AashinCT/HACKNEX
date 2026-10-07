import { analysisDetails, analysisList } from '../data/analysisMock'
import { datasets } from '../data/mockData'

// Empty VITE_API_URL means "use mock data"
const API_URL = import.meta.env.VITE_API_URL
const USE_MOCK = !API_URL

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

// Mock only: decides which sample result to show for a question
function pickMockAnalysisId(question, mode) {
  if (question.toLowerCase().includes('profit')) return 'a-098'
  if (mode === 'blend') return 'a-100'
  if (mode === 'external') return 'a-099'
  return 'a-101'
}

export async function getDatasets() {
  if (USE_MOCK) {
    await wait()
    return datasets
  }
  return request('/datasets')
}

export async function uploadDataset(file) {
  if (USE_MOCK) {
    await wait()
    return { id: 'd-new', name: file.name }
  }
  const body = new FormData()
  body.append('file', file)
  return request('/datasets/upload', { method: 'POST', body })
}

export async function analyzeQuestion({ question, mode }) {
  if (USE_MOCK) {
    await wait()
    return { id: pickMockAnalysisId(question, mode) }
  }
  return request('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode }),
  })
}

export async function getAnalyses() {
  if (USE_MOCK) {
    await wait()
    return analysisList
  }
  return request('/analyses')
}

export async function getAnalysis(id) {
  if (USE_MOCK) {
    await wait()
    const found = analysisDetails[id]
    if (!found) throw new Error('Analysis not found')
    return found
  }
  return request(`/analyses/${id}`)
}

export async function getEvidence(analysisId) {
  if (USE_MOCK) {
    await wait()
    return []
  }
  return request(`/analyses/${analysisId}/evidence`)
}

export async function getProof(analysisId) {
  if (USE_MOCK) {
    await wait()
    return null
  }
  return request(`/analyses/${analysisId}/proof`)
}

export async function getExternalSources(analysisId) {
  if (USE_MOCK) {
    await wait()
    return []
  }
  return request(`/analyses/${analysisId}/sources`)
}

export async function downloadProof(analysisId) {
  if (USE_MOCK) {
    await wait()
    return null
  }
  const response = await fetch(`${API_URL}/analyses/${analysisId}/proof/download`)
  if (!response.ok) throw new Error('Unable to download proof')
  return response.blob()
}