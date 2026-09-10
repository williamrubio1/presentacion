import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Loader2, TriangleAlert, LogOut, Settings } from 'lucide-react'
import DashboardHeader from '../components/layout/DashboardHeader.jsx'
import MetricCards from '../components/dashboard/MetricCards.jsx'
import ActivityChart from '../components/dashboard/ActivityChart.jsx'
import EmailTable from '../components/dashboard/EmailTable.jsx'
import ClientTimeline from '../components/dashboard/ClientTimeline.jsx'
import Followups from '../components/dashboard/Followups.jsx'
import Alerts from '../components/dashboard/Alerts.jsx'
import AISummary from '../components/dashboard/AISummary.jsx'
import LoginGate from '../components/dashboard/LoginGate.jsx'
import EmailDetail from '../components/dashboard/EmailDetail.jsx'
import { useDashboardData } from '../hooks/useDashboardData.js'
import { api, isLive as apiIsLive } from '../lib/api.js'
import { MOCK_INTENTS, mockGenerateDraft } from '../lib/dashboardData.js'

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'accion', label: 'Requieren respuesta' },
]

export default function Dashboard() {
  const { data, loading, error, needsAuth, isLive, reload, actions } = useDashboardData()
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('todos')
  const [intents, setIntents] = useState(apiIsLive ? [] : MOCK_INTENTS)

  useEffect(() => {
    if (needsAuth || !isLive) return
    api.intents().then(setIntents).catch(() => setIntents([]))
  }, [needsAuth, isLive, data?.updatedAt])

  const emails = useMemo(() => {
    const all = data?.emails ?? []
    if (filter === 'accion') {
      return all.filter(
        (e) => e.necesitaRespuesta && e.estado !== 'Respondido',
      )
    }
    return all
  }, [data, filter])

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100">
        <DashboardHeader mode="demo" />
        <LoginGate onLogin={actions.login} />
      </div>
    )
  }

  const openEmail = data?.emails.find((e) => e.id === openId) || null
  const pendientes = (data?.emails ?? []).filter(
    (e) => e.necesitaRespuesta && e.estado !== 'Respondido',
  ).length

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <DashboardHeader mode={isLive ? 'live' : 'demo'} />

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {isLive ? 'Conectado al buzón — datos reales' : 'Modo demostración — datos simulados'}
            {data?.updatedAt && (
              <>
                {' · actualizado '}
                {new Date(data.updatedAt).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            {isLive && (
              <>
                <Link
                  to="/config"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
                >
                  <Settings size={13} />
                  Configuración
                </Link>
                <button
                  type="button"
                  onClick={actions.logout}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
                >
                  <LogOut size={13} />
                  Salir
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <TriangleAlert size={16} />
            No se pudieron cargar los datos ({error.message}).
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Cargando panel…
          </div>
        ) : data ? (
          <>
            <MetricCards metrics={data.metrics} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityChart data={data.activity} />
              </div>
              <AISummary summary={data.aiSummary} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <div className="flex gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        filter === f.id
                          ? 'bg-[#4361ee] text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {f.label}
                      {f.id === 'accion' && pendientes > 0 ? ` (${pendientes})` : ''}
                    </button>
                  ))}
                </div>
                <EmailTable
                  emails={emails}
                  selectedId={openId}
                  onOpen={(mail) => setOpenId(mail.id)}
                />
              </div>
              <div className="space-y-6">
                <Followups
                  items={data.seguimientos ?? []}
                  onAdd={actions.addFollowup}
                  onToggle={actions.toggleFollowup}
                  onDelete={actions.deleteFollowup}
                />
                <ClientTimeline
                  cliente={openEmail?.remitente}
                  eventos={openEmail ? data.timelines?.[openEmail.remitente] : null}
                />
              </div>
            </div>

            <Alerts alerts={data.alerts} />
          </>
        ) : null}
      </main>

      {openEmail && (
        <EmailDetail
          key={openEmail.id}
          email={openEmail}
          intents={intents}
          onClose={() => setOpenId(null)}
          onReply={actions.reply}
          onResolve={(id) => actions.update(id, { status: 'resuelto' })}
          onAction={actions.emailAction}
          onGenerate={(id, intentId, instr) =>
            apiIsLive ? api.generateDraft(id, intentId, instr) : mockGenerateDraft(id, intentId, instr)
          }
        />
      )}
    </div>
  )
}
