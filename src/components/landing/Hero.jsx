import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a1a2e] to-[#1e2a5a] text-white"
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#4361ee]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#4361ee]/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
          <Sparkles size={14} className="text-[#8ea2ff]" />
          Automatización accesible para PYMES
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Automatización inteligente para tu negocio
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          Transforma tareas repetitivas en procesos eficientes con tecnología
          accesible
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#4361ee] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#4361ee]/30 transition hover:bg-[#3651c8]"
          >
            Ver Dashboard en vivo
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>
          <a
            href="#servicios"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Conocer más
          </a>
        </div>
      </div>
    </section>
  )
}
