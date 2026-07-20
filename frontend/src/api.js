const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
let activeRequests = 0
const loadingListeners = new Set()
let currentProfile = null
const authListeners = new Set()

function notifyLoading(){
  const isLoading = activeRequests > 0
  loadingListeners.forEach(fn => fn(isLoading))
}

function notifyAuth(){
  authListeners.forEach(fn => fn(currentProfile))
}

function normalizeApplicationId(applicationId){
  const parsedId = Number(applicationId)
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error('Application ID must be a positive integer')
  }
  return parsedId
}

function normalizeJobId(jobId){
  // Accept either primitive id (string/number) or an object containing id fields
  if (jobId && typeof jobId === 'object') {
    jobId = jobId.job_id ?? jobId.jobId ?? jobId.id ?? jobId._id ?? jobId
    if (jobId && typeof jobId === 'object' && jobId.$oid) jobId = jobId.$oid
  }
  const parsed = Number(jobId)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Job ID must be a positive integer')
  }
  return parsed
}

function normalizeDecision(decision){
  if (decision !== 'hire' && decision !== 'reject') {
    throw new Error('Decision must be either "hire" or "reject"')
  }
  return decision
}

export function onLoadingChange(fn){
  loadingListeners.add(fn)
  fn(activeRequests > 0)
  return () => loadingListeners.delete(fn)
}

export function onAuthChange(fn){
  authListeners.add(fn)
  fn(currentProfile)
  return () => authListeners.delete(fn)
}

async function refreshProfile(){
  try {
    const profile = await request('/profile', { method: 'GET' })
    currentProfile = profile
    notifyAuth()
    return profile
  } catch (err) {
    currentProfile = null
    notifyAuth()
    throw err
  }
}

async function request(path, opts = {}){
  activeRequests += 1
  notifyLoading()
  try {
    const res = await fetch(BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...opts
    })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
    if (!res.ok) {
      const error = new Error(data?.msg || `Request failed with status ${res.status}`)
      error.status = res.status
      error.data = data
      throw error
    }
    return data
  } finally {
    activeRequests = Math.max(0, activeRequests - 1)
    notifyLoading()
  }
}

export const api = {
  registerWorker: (payload) => request('/register/worker', { method: 'POST', body: JSON.stringify(payload) }),
  registerCompany: (payload) => request('/register/company', { method: 'POST', body: JSON.stringify(payload) }),
  loginWorker: async (payload) => {
    const result = await request('/login/worker', { method: 'POST', body: JSON.stringify(payload) })
    await refreshProfile()
    return result
  },
  loginCompany: async (payload) => {
    const result = await request('/login/company', { method: 'POST', body: JSON.stringify(payload) })
    await refreshProfile()
    return result
  },
  logout: async () => {
    const result = await request('/logout', { method: 'GET' })
    currentProfile = null
    notifyAuth()
    return result
  },
  getProfile: () => refreshProfile(),
  addJob: (payload) => request('/jobs/add', { method: 'POST', body: JSON.stringify(payload) }),
  getJobs: (page = 1, limit = 10) => request(`/jobs?page=${page}&limit=${limit}`, { method: 'GET' }),
  searchJobs: (filters = {}) => request('/jobs/filtered', {
    method: 'POST',
    body: JSON.stringify(filters)
  }),
  getJob: (job_id) => request(`/jobs/${job_id}`, { method: 'GET' }),
  getCompany: (companyId) => request(`/companies/${companyId}`, { method: 'GET' }),
  getCities: () => request('/cities', { method: 'GET' }),
  applyToJob: (job_id) => {
    const normalizedJobId = normalizeJobId(job_id)
    return request(`/jobs/${normalizedJobId}/application`, { method: 'POST' })
  },
  getApplications: () => request('/worker/applications', { method: 'GET' }),
  processApplication: (applicationId, decision) => {
    const normalizedApplicationId = normalizeApplicationId(applicationId)
    const normalizedDecision = normalizeDecision(decision)
    return request(`/applications/${normalizedApplicationId}?decision=${encodeURIComponent(normalizedDecision)}`, {
      method: 'POST'
    })
  }
}

// Company-specific job openings and CRUD
api.getJobOpeningsOfCompany = (page = 1, size = 10) => request(`/company/jobs?page=${page}&size=${size}`, { method: 'GET' })
api.updateJob = (job_id, payload) => request(`/company/jobs/${job_id}`, { method: 'PUT', body: JSON.stringify(payload) })
api.deleteJob = (job_id) => request(`/company/jobs/${job_id}`, { method: 'DELETE' })
api.getCompanyApplications = (page = 1, size = 10) => request(`/company/applications?page=${page}&size=${size}`, { method: 'GET' })
api.getCompanyApplication = (applicationId) => request(`/company/application/${applicationId}`, { method: 'GET' })
api.processCompanyApplication = (applicationId, decision) => {
  const normalizedApplicationId = normalizeApplicationId(applicationId)
  const normalizedDecision = normalizeDecision(decision)
  return request(`/company/application/${normalizedApplicationId}?decision=${encodeURIComponent(normalizedDecision)}`, {
    method: 'POST'
  })
}

export { api as default }
