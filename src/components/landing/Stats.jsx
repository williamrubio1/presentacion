import { useReveal } from '../../hooks/useReveal.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import Reveal from '../Reveal.jsx'

const stats = [
  {
    end: 1400,
    prefix: '',
    suffix: '+',
    label: 'Empresas colombianas adoptaron IA en 2025',
    source: 'Portafolio',
  },
  {
    end: 105,
    prefix: '',
    suffix: ' min',
    label: 'Ahorro semanal promedio por empleado',
    source: 'Davinci Technologies',
  },
  {
    end: 66,
    prefix: '',
    suffix: '%',
    label: 'PYMES colombianas ya integran IA',
    source: 'Sense Digital',
  },
]

function StatItem({ stat, delay }) {
  const { ref, visible } = useReveal()
  const val = useCountUp(stat.end, { start: visible, duration: 1600 })
  return (
    <div
      ref={ref}
      className="reveal is-visible rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-4xl font-bold tabular-nums text-[#4361ee] sm:text-5xl">
        {stat.prefix}
        {Math.round(val).toLocaleString('es-CO')}
        {stat.suffix}
      </p>
      <p className="mt-3 text-sm font-medium text-slate-700">{stat.label}</p>
      <p className="mt-2 text-xs text-slate-400">Fuente: {stat.source}</p>
    </div>
  )
}

export default function Stats() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Automatización en Colombia
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            No es el futuro: ya está pasando en el país.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <StatItem key={s.label} stat={s} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  )
}
