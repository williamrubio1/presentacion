import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { api, isLive } from '../lib/api.js'

function IntentRow({ intent, onChange, onDelete }) {
  const [busy, setBusy] = useState(false)
  const wrap = async (fn) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-white/10 p-4 ${intent.active ? 'bg-[#0b1120]' : 'bg-[#0b1120]/40'}`}
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          {intent.label}
          {intent.is_builtin ? (
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              de fábrica
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{intent.description}</p>
        {intent.prompt_hint ? (
          <p className="mt-1 text-xs text-slate-500">Pauta: {intent.prompt_hint}</p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={busy}
        title={intent.active ? 'Desactivar' : 'Activar'}
        onClick={() => wrap(() => onChange(intent.id, { active: !intent.active }))}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        {intent.active ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
      <button
        type="button"
        disabled={busy}
        title={intent.is_builtin ? 'Desactivar' : 'Eliminar'}
        onClick={() => wrap(() => onDelete(intent.id))}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  )
}

export default function Config() {
  const [intents, setIntents] = useState(null)
  const [error, setError] = useState(
    isLive ? null : 'Configuración disponible solo con el backend conectado.',
  )
  const [form, setForm] = useState({ label: '', description: '', prompt_hint: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    () =>
      api
        .intents()
        .then(setIntents)
        .catch((e) =>
          setError(
            e.code === 'UNAUTHENTICATED' ? 'Inicia sesión en el panel primero.' : e.message,
          ),
        ),
    [],
  )

  useEffect(() => {
    if (isLive) load()
  }, [load])

  const create = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createIntent(form)
      setForm({ label: '', description: '', prompt_hint: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const onChange = async (id, patch) => {
    await api.updateIntent(id, patch)
    load()
  }
  const onDelete = async (id) => {
    await api.deleteIntent(id)
    load()
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <header className="border-b border-white/10 bg-[#0b1120]">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
          <p className="text-sm font-bold text-white">Configuración</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-5 py-8">
        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        <section>
          <h2 className="text-lg font-bold text-white">Intenciones de respuesta</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cada intención es un botón en el panel de detalle del correo. Al pulsarlo,
            la IA redacta la respuesta con esa intención.
          </p>

          <form
            onSubmit={create}
            className="mt-4 space-y-3 rounded-xl border border-white/10 bg-[#0b1120] p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Nombre (ej: Confirmar pago)"
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#4361ee]"
              />
              <input
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Qué debe lograr la respuesta"
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#4361ee]"
              />
            </div>
            <input
              value={form.prompt_hint}
              onChange={(e) => setForm((f) => ({ ...f, prompt_hint: e.target.value }))}
              placeholder="Pauta opcional para la IA (tono, qué incluir…)"
              className="w-full rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#4361ee]"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3651c8] disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Añadir intención
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {intents === null && !error ? (
              <p className="text-sm text-slate-500">Cargando…</p>
            ) : (
              (intents ?? []).map((it) => (
                <IntentRow key={it.id} intent={it} onChange={onChange} onDelete={onDelete} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
