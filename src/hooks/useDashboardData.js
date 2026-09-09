import { useEffect, useState } from 'react'
import { getDashboardData, isLive } from '../lib/dashboardData.js'

// Carga los datos del panel y expone estado de carga/error + recarga manual.
// En Fase 4 aquí se engancha la suscripción en tiempo real de Supabase.
export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    let active = true

    getDashboardData({ signal: ctrl.signal })
      .then((d) => {
        if (!active) return
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        if (!active || e.name === 'AbortError') return
        setError(e)
        setLoading(false)
      })

    return () => {
      active = false
      ctrl.abort()
    }
  }, [nonce])

  const reload = () => {
    setLoading(true)
    setError(null)
    setNonce((n) => n + 1)
  }

  return { data, loading, error, isLive, reload }
}
