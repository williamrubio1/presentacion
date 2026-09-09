import { Router } from 'express'
import { config } from '../config.js'
import { issueSession, clearSession, isAuthed, requireAuth, requireCronKey } from '../middleware/session.js'
import { assembleDashboard } from '../services/dashboard.js'
import { getContact, updateEmail, sendReply } from '../services/emails.js'
import { runSync, classifyPending } from '../graph/sync.js'
import { ensureSubscription } from '../graph/subscription.js'
import { getOrBuildWeeklySummary } from '../services/summary.js'
import { handleGraphNotification } from './graphNotifications.js'

export const api = Router()

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
    res.json(await getOrBuildWeeklySummary())
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

api.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }))
