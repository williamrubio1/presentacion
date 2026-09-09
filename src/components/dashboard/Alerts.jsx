import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { alerts } from '../../data/mockData.js'

const config = {
  red: {
    icon: AlertCircle,
    box: 'border-red-500/30 bg-red-500/10',
    dot: 'bg-red-500',
    text: 'text-red-200',
  },
  amber: {
    icon: Clock,
    box: 'border-amber-500/30 bg-amber-500/10',
    dot: 'bg-amber-500',
    text: 'text-amber-200',
  },
  green: {
    icon: CheckCircle2,
    box: 'border-emerald-500/30 bg-emerald-500/10',
    dot: 'bg-emerald-500',
    text: 'text-emerald-200',
  },
}

export default function Alerts() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
      <h3 className="text-sm font-semibold text-white">Alertas activas</h3>
      <div className="mt-4 space-y-3">
        {alerts.map((a) => {
          const c = config[a.tone]
          const Icon = c.icon
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${c.box}`}
            >
              <span className={`pulse-dot h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
              <Icon size={16} className={c.text} />
              <p className={`text-sm ${c.text}`}>{a.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
