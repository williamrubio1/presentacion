import { useReveal } from '../../hooks/useReveal.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { Mail } from 'lucide-react'

export default function Problem() {
  const { ref, visible } = useReveal()
  const correos = useCountUp(28800, { start: visible, duration: 1800 })

  return (
    <section
      ref={ref}
      className="bg-gradient-to-br from-[#1a1a2e] to-[#0f172a] py-20 text-white"
    >
      <div className="mx-auto max-w-4xl px-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#8ea2ff]">
          El problema
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-snug sm:text-4xl">
          Un profesional dedica el{' '}
          <span className="text-[#8ea2ff]">28% de su jornada laboral</span> a
          leer y responder correos
        </h2>
        <p className="mt-3 text-sm text-slate-400">Fuente: McKinsey</p>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-center gap-3 text-slate-300">
            <Mail size={20} className="text-[#8ea2ff]" />
            <span className="text-sm">
              120 correos/día × 5 días × 48 semanas
            </span>
          </div>
          <p className="mt-4 text-5xl font-bold tabular-nums text-white sm:text-6xl">
            {Math.round(correos).toLocaleString('es-CO')}
          </p>
          <p className="mt-2 text-sm text-slate-400">correos al año</p>
        </div>
      </div>
    </section>
  )
}
