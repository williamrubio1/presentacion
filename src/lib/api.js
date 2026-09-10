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
