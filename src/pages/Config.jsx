import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Loader2, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { api, isLive } from '../lib/api.js'

const CATEGORIAS = ['Cliente nuevo', 'Cotización', 'Reclamo', 'Proveedor', 'Informativo', 'Seguimiento']
const CAMPOS = { remitente: 'Remitente', dominio: 'Dominio', asunto: 'Asunto', cuerpo: 'Cuerpo' }
const OPS = { contiene: 'contiene', igual: 'es igual a', regex: 'coincide con regex' }

function RulesSection() {
  const [rules, setRules] = useState(null)
  const [form, setForm] = useState({
    field: 'remitente',
    op: 'contiene',
    value: '',
    action: 'categoria',
    action_value: 'Informativo',
  })
  const [saving, setSaving] = useState(false)
  const [reclas, setReclas] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(() => api.rules().then(setRules).catch((e) => setErr(e.message)), [])
  useEffect(() => {
    load()
  }, [load])

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      const body = { ...form }
      if (form.action === 'ignorar') body.action_value = null
      await api.createRule(body)
      setForm((f) => ({ ...f, value: '' }))
      await load()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setSaving(false)
    }
  }

  const reclassify = async () => {
    setReclas('run')
    try {
      await api.reclassify()
      setReclas('done')
    } catch {
      setReclas('err')
    }
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-white">Reglas de clasificación</h2>
      <p className="mt-1 text-sm text-slate-400">
        Se aplican antes de la IA. "Ignorar" archiva el correo y no lo muestra en el panel.
      </p>

      <form onSubmit={add} className="mt-4 space-y-3 rounded-xl border border-white/10 bg-[#0b1120] p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-400">Si</span>
          <select
            value={form.field}
            onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
            className="rounded-lg border border-white/10 bg-[#0f172a] px-2 py-1.5 text-slate-100"
          >
            {Object.entries(CAMPOS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={form.op}
            onChange={(e) => setForm((f) => ({ ...f, op: e.target.value }))}
            className="rounded-lg border border-white/10 bg-[#0f172a] px-2 py-1.5 text-slate-100"
          >
            {Object.entries(OPS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input
            required
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder="texto…"
            className="min-w-[8rem] flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-2 py-1.5 text-slate-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-400">entonces</span>
          <select
            value={form.action}
            onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
            className="rounded-lg border border-white/10 bg-[#0f172a] px-2 py-1.5 text-slate-100"
          >
            <option value="categoria">poner categoría</option>
            <option value="prioridad">poner prioridad</option>
            <option value="ignorar">ignorar (archivar)</option>
          </select>
          {form.action === 'categoria' && (
            <select
              value={form.action_value}
              onChange={(e) => setForm((f) => ({ ...f, action_value: e.target.value }))}
              className="rounded-lg border border-white/10 bg-[#0f172a] px-2 py-1.5 text-slate-100"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          {form.action === 'prioridad' && (
            <select
              value={form.action_value}
              onChange={(e) => setForm((f) => ({ ...f, action_value: e.target.value }))}
              className="rounded-lg border border-white/10 bg-[#0f172a] px-2 py-1.5 text-slate-100"
            >
              {['alta', 'media', 'baja'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3651c8] disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Añadir regla
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {rules === null ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-slate-500">Sin reglas. Se usa solo la IA.</p>
        ) : (
          rules.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-3 rounded-xl border border-white/10 p-3 text-sm ${r.active ? 'bg-[#0b1120]' : 'bg-[#0b1120]/40'}`}
            >
              <p className="flex-1 text-slate-300">
                <span className="text-slate-400">Si </span>
                <b className="text-white">{CAMPOS[r.field]}</b> {OPS[r.op]}{' '}
                <b className="text-white">"{r.value}"</b>
                <span className="text-slate-400"> → </span>
                {r.action === 'ignorar' ? (
                  <b className="text-white">ignorar</b>
                ) : (
                  <>
                    {r.action} = <b className="text-white">{r.action_value}</b>
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => api.updateRule(r.id, { active: !r.active }).then(load)}
                className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                {r.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                type="button"
                onClick={() => api.deleteRule(r.id).then(load)}
                className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={reclassify}
        disabled={reclas === 'run'}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
      >
        {reclas === 'run' ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
        Reclasificar todos los correos
      </button>
      {reclas === 'done' && (
        <p className="mt-2 text-sm text-emerald-400">
          Reclasificación en curso. Puede tardar unos minutos; actualiza el panel.
        </p>
      )}
      {reclas === 'err' && <p className="mt-2 text-sm text-red-400">No se pudo iniciar.</p>}
    </section>
  )
}

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

        {isLive && <RulesSection />}
      </main>
    </div>
  )
}
