import { query, one } from '../db.js'
import { chat, aiEnabled } from '../ai/llm.js'

function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return `semana-${date.getUTCFullYear()}-${String(week).padStart(2, '0')}`
}

async function weekStats() {
  const [tot] = await query(
    `SELECT COUNT(*) recibidos,
            SUM(CASE WHEN status IN ('respondido','resuelto') THEN 1 ELSE 0 END) respondidos
       FROM emails
      WHERE from_owner = 0 AND received_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)`,
  )
  const cats = await query(
    `SELECT category, COUNT(*) n FROM emails
      WHERE from_owner = 0 AND received_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)
      GROUP BY category ORDER BY n DESC`,
  )
  const pendientes = await query(
    `SELECT from_name, from_email FROM emails
      WHERE from_owner = 0 AND needs_reply = 1 AND status IN ('pendiente','en_espera')
        AND received_at < (UTC_TIMESTAMP() - INTERVAL 2 DAY)
      ORDER BY received_at ASC LIMIT 5`,
  )
  return { tot, cats, pendientes }
}

function templateSummary({ tot, cats, pendientes }) {
  const recibidos = Number(tot?.recibidos || 0)
  const respondidos = Number(tot?.respondidos || 0)
  const pct = recibidos ? Math.round((respondidos / recibidos) * 100) : 0
  const topCat = cats[0]
  const topPct = topCat && recibidos ? Math.round((topCat.n / recibidos) * 100) : 0
  const nombres = [...new Set(pendientes.map((p) => p.from_name || p.from_email))].join(', ')

  let text = `Esta semana se recibieron ${recibidos} correos. Se respondieron ${respondidos} (${pct}%).`
  if (pendientes.length) {
    text += ` ${pendientes.length} contacto(s) llevan más de 48 horas sin respuesta: ${nombres}.`
  }
  if (topCat?.category) {
    text += ` La categoría con más volumen fue ${topCat.category} (${topPct}%).`
  }
  text += ' Se recomienda priorizar los reclamos pendientes antes del cierre del día.'
  return text
}

async function llmSummary(stats) {
  if (!aiEnabled) return null
  const base = templateSummary(stats)
  try {
    return await chat({
      system:
        'Redacta un resumen ejecutivo en español (máx. 4 frases) del correo de la semana para un panel de control. Tono profesional y accionable.',
      user: `Datos base: ${base}`,
      temperature: 0.3,
    })
  } catch {
    return base
  }
}

const TITLE = '📊 Resumen semanal generado por IA'

let building = null // evita regeneraciones concurrentes

async function storeSummary(period, text) {
  await query(
    `INSERT INTO ai_summaries (period, title, body) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), created_at = UTC_TIMESTAMP()`,
    [period, TITLE, text],
  )
}

// RÁPIDO — para el panel. Nunca llama al LLM: devuelve el cache o una plantilla.
// Si el cache está viejo, dispara la regeneración con IA en segundo plano.
export async function getWeeklySummary() {
  const period = isoWeekKey()
  const existing = await one(
    'SELECT body, created_at FROM ai_summaries WHERE period = ?',
    [period],
  )

  if (existing) {
    const stale = Date.now() - new Date(existing.created_at).getTime() > 12 * 3600 * 1000
    if (stale) buildWeeklySummary().catch(() => {})
    return { title: TITLE, text: existing.body }
  }

  // Sin cache: plantilla inmediata (sin IA) y regeneración en segundo plano.
  const text = templateSummary(await weekStats())
  await storeSummary(period, text)
  buildWeeklySummary().catch(() => {})
  return { title: TITLE, text }
}

// LENTO — para el cron. Genera con IA y cachea. Una sola a la vez.
export async function buildWeeklySummary() {
  if (building) return building
  building = (async () => {
    const period = isoWeekKey()
    const stats = await weekStats()
    const text = (await llmSummary(stats)) || templateSummary(stats)
    await storeSummary(period, text)
    return { title: TITLE, text }
  })().finally(() => {
    building = null
  })
  return building
}
