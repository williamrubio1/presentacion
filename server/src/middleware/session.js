import jwt from 'jsonwebtoken'
import { config } from '../config.js'

const COOKIE = 'panel_session'

export function issueSession(res) {
  const token = jwt.sign({ role: 'panel' }, config.sessionSecret, { expiresIn: '7d' })
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: config.cookieDomain || undefined,
    maxAge: 7 * 24 * 3600 * 1000,
  })
}

export function clearSession(res) {
  res.clearCookie(COOKIE, {
    domain: config.cookieDomain || undefined,
    sameSite: 'none',
    secure: true,
  })
}

export function isAuthed(req) {
  const token = req.cookies?.[COOKIE]
  if (!token) return false
  try {
    jwt.verify(token, config.sessionSecret)
    return true
  } catch {
    return false
  }
}

export function requireAuth(req, res, next) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'No autenticado' })
  next()
}

// Endpoints de cron: protegidos por un secreto en la query (?key=...).
export function requireCronKey(req, res, next) {
  if (req.query.key !== config.cronSecret) {
    return res.status(403).json({ error: 'Clave de cron inválida' })
  }
  next()
}
