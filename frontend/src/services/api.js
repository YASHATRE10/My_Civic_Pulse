const BASE_URL = 'http://localhost:9090'

export async function apiRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
  const finalHeaders = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

export const authApi = {
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload }),
}

export const grievanceApi = {
  create: (payload, token) => apiRequest('/api/grievances/submit', { method: 'POST', body: payload, token }),
  mine: (token) => apiRequest('/api/grievances/my', { token }),
  all: (token) => apiRequest('/api/grievances/all', { token }),
  byOfficer: (token) => apiRequest('/api/grievances/officer/assigned', { token }),
  updateStatus: (id, payload, token) => apiRequest(`/api/grievances/${id}/status`, { method: 'PUT', body: payload, token }),
  officerUpdate: (id, payload, token) => apiRequest(`/api/grievances/${id}/officer-update`, { method: 'PUT', body: payload, token }),
  assign: (payload, token) => apiRequest('/api/grievances/admin/assign', { method: 'POST', body: payload, token }),
  kanban: (token) => apiRequest('/api/grievances/kanban', { token }),
  autoAssign: (category, token) => apiRequest(`/api/grievances/admin/auto-assign?category=${encodeURIComponent(category || '')}`, { token }),
  analytics: (query, token) => {
    const params = new URLSearchParams()
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, v)
    })
    return apiRequest(`/api/grievances/analytics${params.size ? `?${params.toString()}` : ''}`, { token })
  },
}

export const feedbackApi = {
  submit: (payload, token) => apiRequest('/api/feedback', { method: 'POST', body: payload, token }),
  byGrievance: (id, token) => apiRequest(`/api/feedback/${id}`, { token }),
  transparencyScore: (token) => apiRequest('/api/feedback/transparency-score', { token }),
}
