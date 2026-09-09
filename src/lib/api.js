// Cliente del backend (server/). Sin VITE_API_URL, el panel funciona en modo
// demostración con datos simulados (ver dashboardData.js).

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''

export const isLive = Boolean(API_URL)

async function req(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    const err = new Error('No autenticado')
    err.code = 'UNAUTHENTICATED'
    throw err
  }
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`)
  return data
}

export const api = {
  session: (signal) => req('/api/me', { signal }),
  login: (password) => req('/api/login', { method: 'POST', body: { password } }),
  logout: () => req('/api/logout', { method: 'POST' }),
  dashboard: (signal) => req('/api/dashboard', { signal }),
  contact: (email, signal) => req(`/api/contacts/${encodeURIComponent(email)}`, { signal }),
  updateEmail: (id, patch) => req(`/api/emails/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
  reply: (id, bodyText) =>
    req(`/api/emails/${encodeURIComponent(id)}/reply`, { method: 'POST', body: { body: bodyText } }),
}
