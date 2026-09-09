import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function formatoFechaHora(d) {
  const fecha = d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const hora = d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return { fecha, hora }
}

export default function DashboardHeader() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { fecha, hora } = formatoFechaHora(now)

  return (
    <header className="border-b border-white/10 bg-[#0b1120]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <div>
            <p className="text-sm font-bold text-white sm:text-base">
              Soluctia SAS — Centro de Mando
            </p>
            <p className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-400" />
              En vivo
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold capitalize text-slate-200">{fecha}</p>
          <p className="font-mono text-lg tabular-nums text-white">{hora}</p>
        </div>
      </div>
    </header>
  )
}
