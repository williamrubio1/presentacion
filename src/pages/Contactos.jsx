import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Search, Loader2, RefreshCw, Sparkles, Mail, Building2,
  ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'
import { api, isLive } from '../lib/api.js'
import { categoryStyles, fallbackBadge } from '../lib/badges.js'
import EmailDetail from '../components/dashboard/EmailDetail.jsx'

const PELOTA = {
  nosotros: { t: 'Nos toca responder', cls: 'bg-amber-500/15 text-amber-300' },
  ellos: { t: 'Esperamos su respuesta', cls: 'bg-blue-500/15 text-blue-300' },
  nadie: { t: 'Sin pendientes', cls: 'bg-emerald-500/15 text-emerald-300' },
}

function ContactList({ items, sel, onSelect }) {
  const [q, setQ] = useState('')
  const filtered = items.filter((c) =>
    `${c.nombre} ${c.empresa} ${c.email}`.toLowerCase().includes(q.toLowerCase()),
  )
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120]">
      <div className="border-b border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-[#0f172a] px-3">
          <Search size={14} className="text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contacto…"
            className="w-full bg-transparent py-2 text-sm text-slate-100 outline-none"
          />
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.email}>
            <button
              type="button"
              onClick={() => onSelect(c.email)}
              className={`w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${
                sel === c.email ? 'bg-[#4361ee]/10' : ''
              }`}
            >
              <p className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-white">{c.nombre}</span>
                {c.pendientes > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 text-xs text-amber-300">
                    {c.pendientes}
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{c.empresa || c.email}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{c.total} correos</span>
                {c.ultimoContacto && <span>· {c.ultimoContacto}</span>}
                {c.categoria && (
                  <span
                    className={`rounded px-1.5 ring-1 ring-inset ${categoryStyles[c.categoria] ?? fallbackBadge}`}
                  >
                    {c.categoria}
                  </span>
                )}
              </p>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="p-4 text-center text-sm text-slate-500">Sin resultados.</li>
        )}
      </ul>
    </div>
  )
}

function ContactDetail({ email, onOpenEmail }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let alive = true
    api
      .contactoDetalle(email, false)
      .then((d) => {
        if (alive) setData(d)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [email])

  const regenerate = () => {
    setRefreshing(true)
    api
      .contactoDetalle(email, true)
      .then(setData)
      .catch(() => {})
      .finally(() => setRefreshing(false))
  }

  if (loading) {
    return (
      <div className="grid min-h-0 place-items-center rounded-2xl border border-white/10 bg-[#0b1120] text-slate-500">
        <span className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Generando resumen…
        </span>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="grid min-h-0 place-items-center rounded-2xl border border-white/10 bg-[#0b1120] text-slate-500">
        No se pudo cargar.
      </div>
    )
  }

  const pelota = data.quienResponde ? PELOTA[data.quienResponde] : null

  return (
    <div className="min-h-0 space-y-5 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{data.contacto.nombre}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Mail size={12} /> {data.contacto.email}
            </span>
            {data.contacto.empresa && (
              <span className="inline-flex items-center gap-1">
                <Building2 size={12} /> {data.contacto.empresa}
              </span>
            )}
            <span>{data.contacto.total} correos</span>
            {data.contacto.primerContacto && <span>desde {data.contacto.primerContacto}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={regenerate}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Regenerar
        </button>
      </div>

      <div className="rounded-xl border border-[#4361ee]/25 bg-[#4361ee]/10 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-[#8ea2ff]">
          <Sparkles size={13} /> En qué va la conversación
          {data.resumenDesactualizado && (
            <span className="rounded bg-white/10 px-1.5 text-[10px] text-slate-400">actualizando…</span>
          )}
        </p>
        {data.estado && <p className="mt-2 text-sm font-semibold text-white">{data.estado}</p>}
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-200">
          {data.resumen}
        </p>
        {pelota && (
          <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${pelota.cls}`}>
            {pelota.t}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400">
          Correos ({data.correos.length}) — clic para ver y responder
        </p>
        <ul className="mt-2 space-y-1">
          {data.correos.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onOpenEmail(c.id)}
                className="flex w-full items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left text-sm transition hover:border-[#4361ee]/40 hover:bg-white/5"
              >
                {c.direccion === 'enviado' ? (
                  <ArrowUpRight size={14} className="shrink-0 text-emerald-400" />
                ) : (
                  <ArrowDownLeft size={14} className="shrink-0 text-[#8ea2ff]" />
                )}
                <span className="w-20 shrink-0 text-xs text-slate-500">{c.fecha}</span>
                <span className="min-w-0 flex-1 truncate text-slate-300">{c.asunto}</span>
                {c.categoria && (
                  <span
                    className={`shrink-0 rounded px-1.5 text-xs ring-1 ring-inset ${categoryStyles[c.categoria] ?? fallbackBadge}`}
                  >
                    {c.categoria}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {data.timeline.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400">Historial</p>
          <ol className="mt-2 space-y-2">
            {data.timeline.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#4361ee]" />
                <span className="w-24 shrink-0 text-xs text-slate-500">{t.fecha}</span>
                <span className="text-slate-300">{t.evento}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default function Contactos() {
  const [items, setItems] = useState(null)
  const [sel, setSel] = useState(null)
  const [intents, setIntents] = useState([])
  const [openEmail, setOpenEmail] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState(
    isLive ? null : 'Los contactos están disponibles solo con el backend conectado.',
  )

  const load = useCallback(
    () =>
      api
        .contactos()
        .then((list) => {
          setItems(list)
          setSel((s) => s || list[0]?.email || null)
        })
        .catch((e) =>
          setError(e.code === 'UNAUTHENTICATED' ? 'Inicia sesión en el panel primero.' : e.message),
        ),
    [],
  )

  useEffect(() => {
    if (!isLive) return
    load()
    api.intents().then(setIntents).catch(() => {})
  }, [load])

  const openEmailById = (id) => api.email(id).then(setOpenEmail).catch(() => {})
  const refreshAll = () => {
    setRefreshKey((k) => k + 1)
    load()
  }
  const reopen = async (id) => {
    const e = await api.email(id).catch(() => null)
    setOpenEmail(e)
  }

  const handlers = {
    onReply: async (id, body) => {
      await api.reply(id, body)
      refreshAll()
      reopen(id)
    },
    onResolve: async (id) => {
      await api.updateEmail(id, { status: 'resuelto' })
      refreshAll()
      reopen(id)
    },
    onAction: async (id, action) => {
      await api.emailAction(id, action)
      refreshAll()
      if (action !== 'archivar') reopen(id)
    },
    onGenerate: (id, intentId, instr) => api.generateDraft(id, intentId, instr),
  }

  return (
    <div className="flex h-screen flex-col bg-[#0f172a] text-slate-100">
      <header className="border-b border-white/10 bg-[#0b1120]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
          <p className="text-sm font-bold text-white">Contactos</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 overflow-hidden p-5">
        {error ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        ) : items === null ? (
          <div className="flex h-full items-center justify-center gap-2 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Cargando contactos…
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            Aún no hay contactos. Llegarán cuando entren correos.
          </div>
        ) : (
          <div className="grid h-full gap-4 lg:grid-cols-[320px_1fr]">
            <ContactList items={items} sel={sel} onSelect={setSel} />
            {sel ? (
              <ContactDetail key={`${sel}-${refreshKey}`} email={sel} onOpenEmail={openEmailById} />
            ) : (
              <div className="grid place-items-center rounded-2xl border border-white/10 bg-[#0b1120] text-slate-500">
                Selecciona un contacto
              </div>
            )}
          </div>
        )}
      </main>

      {openEmail && (
        <EmailDetail
          key={openEmail.id}
          email={openEmail}
          intents={intents}
          onClose={() => setOpenEmail(null)}
          {...handlers}
        />
      )}
    </div>
  )
}
