import { query, one } from '../db.js'
import { config } from '../config.js'

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
      WHERE from_owner = 0 AND received_at >= (NOW() - INTERVAL 7 DAY)`,
  )
  const cats = await query(
    `SELECT category, COUNT(*) n FROM emails
      WHERE from_owner = 0 AND received_at >= (NOW() - INTERVAL 7 DAY)
      GROUP BY category ORDER BY n DESC`,
  )
  const pendientes = await query(
    `SELECT from_name, from_email FROM emails
      WHERE from_owner = 0 AND needs_reply = 1 AND status IN ('pendiente','en_espera')
        AND received_at < (NOW() - INTERVAL 2 DAY)
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
  const nombres = pendientes.map((p) => p.from_name || p.from_email).join(', ')

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
  if (config.ai.provider === 'none') return null
  const base = templateSummary(stats)
  const url =
    config.ai.provider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : `${config.ai.azureEndpoint}/openai/deployments/${config.ai.azureDeployment}/chat/completions?api-version=2024-08-01-preview`
  const headers = { 'Content-Type': 'application/json' }
  if (config.ai.provider === 'openai') headers.Authorization = `Bearer ${config.ai.openaiKey}`
  else headers['api-key'] = config.ai.azureKey

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...(config.ai.provider === 'openai' ? { model: config.ai.openaiModel } : {}),
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'Redacta un resumen ejecutivo en español (máx. 4 frases) del correo de la semana para un panel de control. Tono profesional y accionable.',
          },
          { role: 'user', content: `Datos base: ${base}` },
        ],
      }),
    })
    if (!res.ok) return base
    const data = await res.json()
    return data.choices[0].message.content.trim()
  } catch {
    return base
  }
}

// Devuelve el resumen de la semana; lo genera y cachea si no existe o es viejo.
export async function getOrBuildWeeklySummary() {
  const period = isoWeekKey()
  const existing = await one('SELECT title, body, created_at FROM ai_summaries WHERE period = ?', [period])
  const stale = existing && Date.now() - new Date(existing.created_at).getTime() > 12 * 3600 * 1000

  if (existing && !stale) {
    return { title: existing.title, text: existing.body }
  }

  const stats = await weekStats()
  const text = (await llmSummary(stats)) || templateSummary(stats)
  const title = '📊 Resumen semanal generado por IA'

  await query(
    `INSERT INTO ai_summaries (period, title, body) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), created_at = NOW()`,
    [period, title, text],
  )
  return { title, text }
}
