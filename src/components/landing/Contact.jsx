import { useState } from 'react'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import Reveal from '../Reveal.jsx'

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    setEnviado(true)
    setForm({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <section id="contacto" className="bg-white py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hablemos
          </h2>
          <p className="mt-3 text-slate-500">
            Cuéntanos qué proceso te está quitando tiempo y te mostramos cómo
            automatizarlo.
          </p>
          <a
            href="mailto:contacto@soluctiasas.com"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#4361ee]/40"
          >
            <Mail size={18} className="text-[#4361ee]" />
            contacto@soluctiasas.com
          </a>
        </Reveal>

        <Reveal delay={120}>
          {enviado ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <CheckCircle2 size={40} className="text-emerald-600" />
              <p className="mt-3 font-semibold text-emerald-800">
                ¡Mensaje enviado!
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Te responderemos pronto (demo — no se envió nada real).
              </p>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="mt-4 text-sm font-medium text-emerald-700 underline"
              >
                Enviar otro
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={onChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20"
                />
              </div>
              <div>
                <label
                  htmlFor="mensaje"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  rows={4}
                  value={form.mensaje}
                  onChange={onChange}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4361ee] px-4 py-3 font-semibold text-white transition hover:bg-[#3651c8]"
              >
                <Send size={16} />
                Enviar mensaje
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
