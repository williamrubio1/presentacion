import { useState } from 'react'
import { ListChecks, Plus, Check, Trash2, Sparkles } from 'lucide-react'

function venceLabel(iso) {
  if (!iso) return null
  const dias = Math.round((new Date(iso + 'T12:00:00') - Date.now()) / 86400000)
  if (dias < 0) return { t: `vencido hace ${-dias}d`, cls: 'text-red-400' }
  if (dias === 0) return { t: 'vence hoy', cls: 'text-amber-400' }
  if (dias === 1) return { t: 'vence mañana', cls: 'text-amber-400' }
  return { t: `en ${dias}d`, cls: 'text-slate-400' }
}

export default function Followups({ items = [], onAdd, onToggle, onDelete }) {
  const [desc, setDesc] = useState('')
  const [due, setDue] = useState('')
  const [busy, setBusy] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    if (!desc.trim()) return
    setBusy(true)
    try {
      await onAdd({ description: desc, due_date: due || null })
      setDesc('')
      setDue('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        <ListChecks size={15} className="text-[#8ea2ff]" />
        Mis pendientes
        {items.length > 0 && (
          <span className="rounded bg-white/10 px-1.5 text-xs text-slate-400">{items.length}</span>
        )}
      </h3>
      <p className="mt-0.5 text-xs text-slate-400">
        Cosas que tú debes hacer. La IA las detecta de los correos; también puedes añadirlas.
      </p>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Ej: enviar contrato a la Clínica"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#4361ee]"
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0f172a] px-2 py-2 text-xs text-slate-300 outline-none focus:border-[#4361ee]"
        />
        <button
          type="submit"
          disabled={busy || !desc.trim()}
          className="rounded-lg bg-[#4361ee] px-2.5 text-white transition hover:bg-[#3651c8] disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </form>

      <ul className="mt-3 space-y-1.5">
        {items.length === 0 && (
          <li className="py-3 text-center text-xs text-slate-500">Nada pendiente. 🎉</li>
        )}
        {items.map((f) => {
          const v = venceLabel(f.vence)
          return (
            <li
              key={f.id}
              className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
            >
              <button
                type="button"
                onClick={() => onToggle(f.id, !f.hecho)}
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                  f.hecho ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-white/20'
                }`}
              >
                {f.hecho && <Check size={11} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${f.hecho ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {f.descripcion}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                  {v && <span className={v.cls}>{v.t}</span>}
                  {f.contacto && <span className="text-slate-500">· {f.contacto}</span>}
                  {f.fuente === 'ia' && (
                    <span className="inline-flex items-center gap-0.5 text-[#8ea2ff]">
                      <Sparkles size={10} /> IA
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(f.id)}
                className="mt-0.5 text-slate-500 transition hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
