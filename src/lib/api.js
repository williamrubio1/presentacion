// Cliente del backend (server/).
//
//   VITE_API_URL sin definir  -> modo demostración (datos simulados)
//   VITE_API_URL definida (aunque sea vacía) -> modo real
//     - vacía  -> mismo origen, peticiones relativas a /api  (recomendado)
//     - con URL -> ese host (desarrollo local: http://localhost:8787)

const raw = import.meta.env.VITE_API_URL

export const isLive = raw !== undefined

const API_URL = (raw ?? '').replace(/\/$/, '')

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

const eid = (id) => encodeURIComponent(id)

export const api = {
  session: (signal) => req('/api/me', { signal }),
  login: (password) => req('/api/login', { method: 'POST', body: { password } }),
  logout: () => req('/api/logout', { method: 'POST' }),
  dashboard: (signal) => req('/api/dashboard', { signal }),
  contact: (email, signal) => req(`/api/contacts/${eid(email)}`, { signal }),

  updateEmail: (id, patch) => req(`/api/emails/${eid(id)}`, { method: 'PATCH', body: patch }),
  reply: (id, bodyText) =>
    req(`/api/emails/${eid(id)}/reply`, { method: 'POST', body: { body: bodyText } }),
  generateDraft: (id, intentId, instruccion) =>
    req(`/api/emails/${eid(id)}/draft`, { method: 'POST', body: { intentId, instruccion } }),

  // Intenciones de respuesta
  intents: (signal) => req('/api/intents', { signal }),
  createIntent: (data) => req('/api/intents', { method: 'POST', body: data }),
  updateIntent: (id, patch) => req(`/api/intents/${eid(id)}`, { method: 'PATCH', body: patch }),
  deleteIntent: (id) => req(`/api/intents/${eid(id)}`, { method: 'DELETE' }),
}
