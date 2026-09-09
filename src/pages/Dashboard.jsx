import { useState } from 'react'
import DashboardHeader from '../components/layout/DashboardHeader.jsx'
import MetricCards from '../components/dashboard/MetricCards.jsx'
import ActivityChart from '../components/dashboard/ActivityChart.jsx'
import EmailTable from '../components/dashboard/EmailTable.jsx'
import ClientTimeline from '../components/dashboard/ClientTimeline.jsx'
import Alerts from '../components/dashboard/Alerts.jsx'
import AISummary from '../components/dashboard/AISummary.jsx'
import { clientTimelines } from '../data/mockData.js'

export default function Dashboard() {
  const [cliente, setCliente] = useState(null)

  const onSelect = (remitente) => {
    setCliente((prev) =>
      prev === remitente ? null : clientTimelines[remitente] ? remitente : prev,
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        <MetricCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>
          <AISummary />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EmailTable selected={cliente} onSelect={onSelect} />
          </div>
          <ClientTimeline cliente={cliente} />
        </div>

        <Alerts />
      </main>
    </div>
  )
}
