import { Mail, LineChart, Bot } from 'lucide-react'
import Reveal from '../Reveal.jsx'

const items = [
  {
    icon: Mail,
    title: 'Automatización de Correo',
    desc: 'Resúmenes automáticos, clasificación y alertas inteligentes.',
  },
  {
    icon: LineChart,
    title: 'Dashboards en Tiempo Real',
    desc: 'Visualiza lo que pasa en tu empresa sin abrir el correo.',
  },
  {
    icon: Bot,
    title: 'Integración con IA',
    desc: 'Copilot, agentes inteligentes y respuestas automatizadas con aprobación humana.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            ¿Qué hacemos?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Tres frentes de trabajo para liberar el tiempo de tu equipo.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal
              key={it.title}
              delay={i * 120}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-[#4361ee]/40 hover:shadow-xl hover:shadow-slate-200"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#4361ee]/10 text-[#4361ee] transition group-hover:bg-[#4361ee] group-hover:text-white">
                <it.icon size={24} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {it.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {it.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
