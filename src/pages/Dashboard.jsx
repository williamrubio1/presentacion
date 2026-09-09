import { useState } from 'react'
import { RefreshCw, Loader2, TriangleAlert, LogOut } from 'lucide-react'
import DashboardHeader from '../components/layout/DashboardHeader.jsx'
import MetricCards from '../components/dashboard/MetricCards.jsx'
import ActivityChart from '../components/dashboard/ActivityChart.jsx'
import EmailTable from '../components/dashboard/EmailTable.jsx'
import ClientTimeline from '../components/dashboard/ClientTimeline.jsx'
import Alerts from '../components/dashboard/Alerts.jsx'
import AISummary from '../components/dashboard/AISummary.jsx'
import LoginGate from '../components/dashboard/LoginGate.jsx'
import EmailDetail from '../components/dashboard/EmailDetail.jsx'
import { useDashboardData } from '../hooks/useDashboardData.js'

export default function Dashboard() {
  const { data, loading, error, needsAuth, isLive, reload, actions } = useDashboardData()
  const [openId, setOpenId] = useState(null)

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100">
        <DashboardHeader mode="demo" />
        <LoginGate onLogin={actions.login} />
      </div>
    )
  }

  const openEmail = data?.emails.find((e) => e.id === openId) || null

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <DashboardHeader mode={isLive ? 'live' : 'demo'} />

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        <div className="flex items-center justify-between gap-3">
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
              <button
                type="button"
                onClick={actions.logout}
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                <LogOut size={13} />
                Salir
              </button>
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
              <div className="lg:col-span-2">
                <EmailTable
                  emails={data.emails}
                  selectedId={openId}
                  onOpen={(mail) => setOpenId(mail.id)}
                />
              </div>
              <ClientTimeline
                cliente={openEmail?.remitente}
                eventos={openEmail ? data.timelines?.[openEmail.remitente] : null}
              />
            </div>

            <Alerts alerts={data.alerts} />
          </>
        ) : null}
      </main>

      {openEmail && (
        <EmailDetail
          key={openEmail.id}
          email={openEmail}
          onClose={() => setOpenId(null)}
          onReply={actions.reply}
          onResolve={(id) => actions.update(id, { status: 'resuelto' })}
        />
      )}
    </div>
  )
}
