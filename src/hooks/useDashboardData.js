import { useCallback, useEffect, useRef, useState } from 'react'
import { api, isLive } from '../lib/api.js'
import { getMockDashboard, mockReply, mockUpdate } from '../lib/dashboardData.js'

const POLL_MS = 30_000

// Carga los datos del panel (backend real o datos simulados), refresca solo
// cada 30 s cuando está en vivo y expone las acciones del panel.
export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [nonce, setNonce] = useState(0)
  const timer = useRef(null)

  const fetchData = useCallback(async (signal) => {
    if (!isLive) return getMockDashboard()
    return api.dashboard(signal)
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    let active = true

    fetchData(ctrl.signal)
      .then((d) => {
        if (!active) return
        setData(d)
        setNeedsAuth(false)
        setError(null)
        setLoading(false)
      })
      .catch((e) => {
        if (!active || e.name === 'AbortError') return
        if (e.code === 'UNAUTHENTICATED') setNeedsAuth(true)
        else setError(e)
        setLoading(false)
      })

    return () => {
      active = false
      ctrl.abort()
    }
  }, [fetchData, nonce])

  // Polling solo en modo vivo y sin errores/login pendiente.
  useEffect(() => {
    if (!isLive || needsAuth || error) return
    timer.current = setInterval(() => setNonce((n) => n + 1), POLL_MS)
    return () => clearInterval(timer.current)
  }, [needsAuth, error])

  const reload = () => setNonce((n) => n + 1)

  const actions = {
    async login(password) {
      await api.login(password)
      setNeedsAuth(false)
      setLoading(true)
      reload()
    },
    async logout() {
      await api.logout()
      setNeedsAuth(true)
      setData(null)
    },
    async reply(id, body) {
      if (isLive) await api.reply(id, body)
      else mockReply(id)
      reload()
    },
    async update(id, patch) {
      if (isLive) await api.updateEmail(id, patch)
      else mockUpdate(id, patch)
      reload()
    },
  }

  return { data, loading, error, needsAuth, isLive, reload, actions }
}
