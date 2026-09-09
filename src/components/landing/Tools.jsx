import { User, Wrench, Server } from 'lucide-react'
import Reveal from '../Reveal.jsx'

const niveles = [
  {
    icon: User,
    nivel: 'Nivel 1',
    perfil: 'Cualquier persona',
    color: 'text-emerald-600 bg-emerald-50 ring-emerald-600/20',
    tools: ['Filtros de correo', 'IFTTT', 'Zapier'],
  },
  {
    icon: Wrench,
    nivel: 'Nivel 2',
    perfil: 'Usuario avanzado',
    color: 'text-blue-600 bg-blue-50 ring-blue-600/20',
    tools: ['Make', 'Google Apps Script', 'Power Automate'],
  },
  {
    icon: Server,
    nivel: 'Nivel 3',
    perfil: 'Técnico',
    color: 'text-purple-600 bg-purple-50 ring-purple-600/20',
    tools: ['n8n self-hosted', 'Supabase', 'APIs y webhooks'],
  },
]

export default function Tools() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Herramientas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Hay un punto de entrada para cada nivel de conocimiento técnico.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {niveles.map((n, i) => (
            <Reveal
              key={n.nivel}
              delay={i * 120}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${n.color}`}
              >
                <n.icon size={14} />
                {n.nivel} · {n.perfil}
              </span>
              <ul className="mt-5 space-y-2">
                {n.tools.map((t) => (
                  <li
                    key={t}
                    className="rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
