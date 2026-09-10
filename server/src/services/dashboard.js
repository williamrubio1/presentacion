import { query } from '../db.js'
import { config } from '../config.js'
import { getWeeklySummary } from './summary.js'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Colombia = UTC-5 todo el año (sin horario de verano). Guardamos en UTC y
// convertimos con un desfase fijo, así no dependemos de la zona horaria del
// servidor MySQL ni de las tablas de zonas.
const CO = 'INTERVAL 5 HOUR'

function horaCO(d) {
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  })
}

// Fecha YYYY-MM-DD de hace `daysAgo` días, en hora de Colombia.
function coDateKey(daysAgo = 0) {
  const dt = new Date(Date.now() - daysAgo * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dt)
}

function estadoPanel(row) {
  if (row.status === 'respondido' || row.status === 'resuelto') return 'Respondido'
  if (row.priority === 'alta' && row.needs_reply) return 'Urgente'
  return 'Pendiente'
}

function humanAge(date) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  if (h < 24) return h === 1 ? '1 hora' : `${h} horas`
  const d = Math.floor(h / 24)
  return d === 1 ? '1 día' : `${d} días`
}

async function metrics() {
  const [{ hoy }] = await query(
    `SELECT COUNT(*) hoy FROM emails
      WHERE from_owner = 0
        AND DATE(received_at - ${CO}) = DATE(UTC_TIMESTAMP() - ${CO})`,
  )
  const [{ sin }] = await query(
    `SELECT COUNT(*) sin FROM emails WHERE from_owner = 0 AND needs_reply = 1
       AND status IN ('pendiente','en_espera')`,
  )
  const [avg] = await query(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, received_at, replied_at)) m
       FROM emails
      WHERE replied_at IS NOT NULL AND received_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)`,
  )
  const [rate] = await query(
    `SELECT
        SUM(CASE WHEN status IN ('respondido','resuelto') THEN 1 ELSE 0 END) resp,
        COUNT(*) total
       FROM emails
      WHERE from_owner = 0 AND received_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)`,
  )

  const avgMin = Math.round(avg?.m || 0)
  const pct = rate?.total ? Math.round((rate.resp / rate.total) * 100) : 0

  return [
    { id: 'correos-hoy', label: 'Correos hoy', value: hoy, suffix: '', icon: 'Mail', tone: 'blue' },
    { id: 'sin-responder', label: 'Sin responder', value: sin, suffix: '', icon: 'AlertTriangle', tone: 'pending' },
    {
      id: 'tiempo-respuesta',
      label: 'Tiempo promedio de respuesta',
      value: avgMin,
      suffix: 'min',
      display: avgMin >= 60 ? `${Math.floor(avgMin / 60)}h ${avgMin % 60}min` : `${avgMin} min`,
      icon: 'Clock',
      tone: 'dark',
    },
    { id: 'tasa-respuesta', label: 'Tasa de respuesta', value: pct, suffix: '%', icon: 'CheckCircle2', tone: 'positive' },
  ]
}

async function activity() {
  const rows = await query(
    `SELECT DATE_FORMAT(received_at - ${CO}, '%Y-%m-%d') d,
            COUNT(*) recibidos,
            SUM(CASE WHEN status IN ('respondido','resuelto') THEN 1 ELSE 0 END) respondidos
       FROM emails
      WHERE from_owner = 0 AND received_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(received_at - ${CO}, '%Y-%m-%d')`,
  )
  const byDay = new Map(rows.map((r) => [r.d, r]))
  const out = []
  for (let i = 6; i >= 0; i--) {
    const key = coDateKey(i)
    const r = byDay.get(key)
    out.push({
      dia: DAYS[new Date(`${key}T12:00:00Z`).getUTCDay()],
      recibidos: Number(r?.recibidos || 0),
      respondidos: Number(r?.respondidos || 0),
    })
  }
  return out
}

async function recentEmails(limit = 25) {
  const rows = await query(
    `SELECT e.*, c.company
       FROM emails e
       LEFT JOIN contacts c ON c.email = e.from_email
      WHERE e.from_owner = 0
      ORDER BY e.received_at DESC
      LIMIT ${Number(limit)}`,
  )
  return rows.map((r) => ({
    id: r.id,
    hora: horaCO(r.received_at),
    receivedAt: new Date(r.received_at).toISOString(),
    remitente: r.from_name || r.from_email,
    email: r.from_email,
    empresa: r.company || '',
    asunto: r.subject || '(sin asunto)',
    categoria: r.category || 'Informativo',
    estado: estadoPanel(r),
    prioridad: r.priority,
    resumen: r.ai_summary || '',
    borrador: r.ai_draft || '',
    webLink: r.web_link || '',
    status: r.status,
  }))
}

async function timelinesFor(emails) {
  const map = {}
  const seen = new Set()
  for (const e of emails) {
    if (seen.has(e.email)) continue
    seen.add(e.email)
    const rows = await query(
      `SELECT occurred_at, description FROM interactions
        WHERE contact_email = ? ORDER BY occurred_at ASC LIMIT 40`,
      [e.email],
    )
    map[e.remitente] = rows.map((row) => ({
      fecha: new Date(row.occurred_at).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Bogota',
      }),
      evento: row.description,
    }))
  }
  return map
}

async function alerts() {
  const out = []

  const [reclamo] = await query(
    `SELECT from_name, from_email, received_at FROM emails
      WHERE category = 'Reclamo' AND status IN ('pendiente','en_espera')
      ORDER BY received_at ASC LIMIT 1`,
  )
  if (reclamo) {
    out.push({
      id: 'reclamo',
      tone: 'red',
      text: `${reclamo.from_name || reclamo.from_email} — Reclamo sin responder hace ${humanAge(reclamo.received_at)}`,
    })
  }

  const [coti] = await query(
    `SELECT from_name, from_email, received_at FROM emails
      WHERE category = 'Cotización' AND status IN ('pendiente','en_espera')
        AND received_at < (UTC_TIMESTAMP() - INTERVAL 1 DAY)
      ORDER BY received_at ASC LIMIT 1`,
  )
  if (coti) {
    out.push({
      id: 'cotizacion',
      tone: 'amber',
      text: `${coti.from_name || coti.from_email} — Cotización pendiente hace ${humanAge(coti.received_at)}`,
    })
  }

  const [rate] = await query(
    `SELECT
        SUM(CASE WHEN status IN ('respondido','resuelto') THEN 1 ELSE 0 END) resp,
        COUNT(*) total
       FROM emails
      WHERE from_owner = 0 AND received_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)`,
  )
  const pct = rate?.total ? Math.round((rate.resp / rate.total) * 100) : 0
  out.push({
    id: 'meta',
    tone: pct >= config.responseRateTarget ? 'green' : 'amber',
    text:
      pct >= config.responseRateTarget
        ? `Meta semanal cumplida: ${pct}% tasa de respuesta`
        : `Tasa de respuesta semanal en ${pct}% (meta ${config.responseRateTarget}%)`,
  })

  return out
}

export async function assembleDashboard() {
  const emails = await recentEmails(25)
  const [m, a, t, al, summary] = await Promise.all([
    metrics(),
    activity(),
    timelinesFor(emails),
    alerts(),
    getWeeklySummary(),
  ])
  return {
    metrics: m,
    activity: a,
    emails,
    timelines: t,
    alerts: al,
    aiSummary: summary,
    updatedAt: new Date().toISOString(),
  }
}
