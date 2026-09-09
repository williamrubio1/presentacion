import { Mail, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp.js'
import { metrics } from '../../data/mockData.js'

const icons = { Mail, AlertTriangle, Clock, CheckCircle2 }

const tones = {
  blue: 'text-[#8ea2ff] bg-[#4361ee]/15',
  pending: 'text-amber-400 bg-amber-500/15',
  dark: 'text-slate-300 bg-white/10',
  positive: 'text-emerald-400 bg-emerald-500/15',
}

function Card({ metric }) {
  const Icon = icons[metric.icon]
  const val = useCountUp(metric.value, { duration: 1400 })
  const shown = metric.display
    ? metric.display
    : `${Math.round(val).toLocaleString('es-CO')}${metric.suffix}`

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[metric.tone]}`}>
        <Icon size={20} />
      </span>
      <p className="mt-4 text-3xl font-bold tabular-nums text-white">{shown}</p>
      <p className="mt-1 text-sm text-slate-400">{metric.label}</p>
    </div>
  )
}

export default function MetricCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.id} metric={m} />
      ))}
    </div>
  )
}
