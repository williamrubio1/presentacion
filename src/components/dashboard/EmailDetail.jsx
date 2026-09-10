import { useState } from 'react'
import { X, Send, Check, Sparkles, Loader2, ExternalLink, Wand2 } from 'lucide-react'
import { categoryStyles, statusStyles, fallbackBadge } from '../../lib/badges.js'

// Panel lateral de decisión sobre un correo: resumen IA, generación de
// respuesta por intención, borrador editable y acciones.
// Se re-monta al cambiar de correo (key={email.id} en el padre).
export default function EmailDetail({ email, intents = [], onClose, onReply, onResolve, onGenerate }) {
  const [draft, setDraft] = useState(email.borrador || '')
  const [instruccion, setInstruccion] = useState('')
  const [busy, setBusy] = useState(null) // 'reply' | 'resolve' | 'gen:<id>'
  const [msg, setMsg] = useState(null)

  const run = async (kind, fn) => {
    setBusy(kind)
    setMsg(null)
    try {
      await fn()
      if (kind === 'reply') setMsg('Respuesta enviada.')
      else if (kind === 'resolve') setMsg('Correo marcado como resuelto.')
    } catch (e) {
      setMsg(e.message || 'La acción falló')
    } finally {
      setBusy(null)
    }
  }

  const generate = (intent) =>
    run(`gen:${intent.id}`, async () => {
      const { draft: text } = await onGenerate(email.id, intent.id, instruccion)
      setDraft(text)
      setMsg(`Borrador generado: ${intent.label}. Revísalo antes de enviar.`)
    })

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#0b1120] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">
              {email.hora} · {email.empresa || email.email}
            </p>
            <h2 className="mt-1 text-base font-bold text-white">{email.asunto}</h2>
            <p className="text-sm text-slate-400">{email.remitente}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryStyles[email.categoria] ?? fallbackBadge}`}
          >
            {email.categoria}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[email.estado] ?? statusStyles.Pendiente}`}
          >
            {email.estado}
          </span>
          {email.webLink && (
            <a
              href={email.webLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300 hover:bg-white/10"
            >
              Abrir en Outlook <ExternalLink size={11} />
            </a>
          )}
        </div>

        {email.resumen && (
          <div className="mt-5 rounded-xl border border-[#4361ee]/25 bg-[#4361ee]/10 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-[#8ea2ff]">
              <Sparkles size={13} /> Resumen IA
            </p>
            <p className="mt-1.5 text-sm text-slate-200">{email.resumen}</p>
          </div>
        )}

        {/* Generar respuesta por intención */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-400">
            Generar respuesta — elige una intención
          </p>
          <input
            value={instruccion}
            onChange={(e) => setInstruccion(e.target.value)}
            placeholder="Instrucción opcional (ej: dile que el precio sube 10%)"
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#4361ee]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {intents.map((it) => (
              <button
                key={it.id}
                type="button"
                title={it.description}
                disabled={busy !== null}
                onClick={() => generate(it)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-[#4361ee]/50 hover:bg-[#4361ee]/10 disabled:opacity-40"
              >
                {busy === `gen:${it.id}` ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Wand2 size={12} className="text-[#8ea2ff]" />
                )}
                {it.label}
              </button>
            ))}
            {intents.length === 0 && (
              <span className="text-xs text-slate-500">
                No hay intenciones activas. Créalas en Configuración.
              </span>
            )}
          </div>
        </div>

        <label className="mt-5 block text-xs font-semibold text-slate-400">
          Borrador de respuesta — revísalo antes de enviar
        </label>
        <textarea
          rows={9}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-[#0f172a] p-3 text-sm text-slate-100 outline-none focus:border-[#4361ee]"
          placeholder="Escribe la respuesta o genérala con una intención…"
        />

        {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={busy !== null || !draft.trim()}
            onClick={() => run('reply', () => onReply(email.id, draft))}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2.5 font-semibold text-white transition hover:bg-[#3651c8] disabled:opacity-50"
          >
            {busy === 'reply' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Enviar respuesta
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('resolve', () => onResolve(email.id))}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
          >
            {busy === 'resolve' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Resuelto
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          El envío sale del buzón real por Microsoft Graph. Nada se envía sin que
          pulses el botón.
        </p>
      </div>
    </div>
  )
}
