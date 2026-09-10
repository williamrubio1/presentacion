import { Router } from 'express'
import { config } from '../config.js'
import { issueSession, clearSession, isAuthed, requireAuth, requireCronKey } from '../middleware/session.js'
import { assembleDashboard } from '../services/dashboard.js'
import { getContact, updateEmail, sendReply } from '../services/emails.js'
import { runSync, classifyPending } from '../graph/sync.js'
import { ensureSubscription } from '../graph/subscription.js'
import { runMigration } from '../db-migrate.js'
import { buildWeeklySummary } from '../services/summary.js'
import { handleGraphNotification } from './graphNotifications.js'
import { listIntents, createIntent, updateIntent, deleteIntent } from '../services/intents.js'
import { generateDraft } from '../services/drafts.js'

export const api = Router()

// Envuelve un handler async y manda los errores al middleware central.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next)

// --- Auth --------------------------------------------------------------
api.post('/login', (req, res) => {
  const { password } = req.body || {}
  if (!password || password !== config.panelPassword) {
    return res.status(401).json({ error: 'Contraseña incorrecta' })
  }
  issueSession(res)
  res.json({ ok: true })
})

api.post('/logout', (req, res) => {
  clearSession(res)
  res.json({ ok: true })
})

api.get('/me', (req, res) => {
  res.json({ authed: isAuthed(req), live: Boolean(config.graph.clientId) })
})

// --- Panel ------------------------------------------------------------
api.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    res.json(await assembleDashboard())
  } catch (e) {
    next(e)
  }
})

api.get('/contacts/:email', requireAuth, async (req, res, next) => {
  try {
    res.json(await getContact(req.params.email.toLowerCase()))
  } catch (e) {
    next(e)
  }
})

api.patch('/emails/:id', requireAuth, async (req, res, next) => {
  try {
    res.json(await updateEmail(req.params.id, req.body || {}))
  } catch (e) {
    next(e)
  }
})

api.post('/emails/:id/reply', requireAuth, async (req, res, next) => {
  try {
    const email = await sendReply(req.params.id, req.body?.body)
    res.json({ ok: true, email })
  } catch (e) {
    next(e)
  }
})

// Genera un borrador para una intención (no lo envía).
api.post(
  '/emails/:id/draft',
  requireAuth,
  h(async (req, res) => {
    const { intentId, instruccion } = req.body || {}
    res.json(await generateDraft(req.params.id, { intentId, instruccion }))
  }),
)

// --- Intenciones de respuesta ---------------------------------------
api.get('/intents', requireAuth, h(async (req, res) => res.json(await listIntents())))
api.post('/intents', requireAuth, h(async (req, res) => res.json(await createIntent(req.body || {}))))
api.patch('/intents/:id', requireAuth, h(async (req, res) => res.json(await updateIntent(req.params.id, req.body || {}))))
api.delete('/intents/:id', requireAuth, h(async (req, res) => {
  await deleteIntent(req.params.id)
  res.json({ ok: true })
}))

// --- Webhook de Microsoft Graph (sin auth, valida clientState) --------
api.post('/graph/notifications', handleGraphNotification)

// --- Cron / mantenimiento (protegido por ?key=) ----------------------
api.get('/cron/sync', requireCronKey, async (req, res, next) => {
  try {
    res.json(await runSync())
  } catch (e) {
    next(e)
  }
})

api.get('/cron/renew', requireCronKey, async (req, res, next) => {
  try {
    res.json(await ensureSubscription())
  } catch (e) {
    next(e)
  }
})

api.get('/cron/summary', requireCronKey, async (req, res, next) => {
  try {
    res.json(await buildWeeklySummary())
  } catch (e) {
    next(e)
  }
})

api.get('/cron/classify', requireCronKey, async (req, res, next) => {
  try {
    res.json({ classified: await classifyPending(Number(req.query.n) || 30) })
  } catch (e) {
    next(e)
  }
})

// Puesta en marcha sin SSH: crea tablas + trae los correos + webhook.
// La clasificación con IA la hace después el cron /api/cron/sync (por lotes).
api.get('/cron/setup', requireCronKey, async (req, res, next) => {
  try {
    const tables = await runMigration()
    const sync = await runSync({ classifyLimit: 0 }).catch((e) => ({ error: e.message }))
    const subscription = await ensureSubscription().catch((e) => ({ error: e.message }))
    res.json({
      ok: true,
      tables,
      sync,
      subscription,
      nota: 'Los correos ya están cargados. La clasificación con IA se completa con el cron cada 5 min, o llama /api/cron/classify?key=...&n=50 varias veces.',
    })
  } catch (e) {
    next(e)
  }
})

api.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }))
