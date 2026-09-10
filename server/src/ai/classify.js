import { chat, aiEnabled } from './llm.js'

// Categorías que entiende el panel (deben existir en src/lib/badges.js del frontend).
export const CATEGORIES = [
  'Cliente nuevo',
  'Cotización',
  'Reclamo',
  'Proveedor',
  'Informativo',
  'Seguimiento',
]

// --- Reglas rápidas (sin costo) -----------------------------------------

const RULES = [
  { cat: 'Reclamo', re: /\b(queja|reclamo|inconformidad|molesto|pésimo|no funciona|demora|tardan)\b/i },
  { cat: 'Cotización', re: /\b(cotizaci[oó]n|cotizar|presupuesto|precio|tarifa|propuesta económica)\b/i },
  { cat: 'Proveedor', re: /\b(factura|remisi[oó]n|orden de compra|pago|nómina|cuenta de cobro)\b/i },
  { cat: 'Informativo', re: /\b(bolet[ií]n|newsletter|novedades|no responder|notificaci[oó]n autom)\b/i },
  { cat: 'Seguimiento', re: /^\s*re:|\b(seguimiento|recordatorio|quedamos|como acordamos)\b/i },
]

function ruleCategory({ subject = '', preview = '' }) {
  const text = `${subject}\n${preview}`
  for (const r of RULES) if (r.re.test(text)) return r.cat
  return null
}

// --- Enriquecimiento con LLM ------------------------------------------

const SYSTEM = `Eres un asistente que clasifica el correo entrante de una empresa colombiana.
Devuelve SOLO un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "category": string,   // EXACTAMENTE uno de: ${CATEGORIES.join(', ')} (copia el valor tal cual, sin traducir)
  "priority": string,   // exactamente: alta, media o baja (en minúscula)
  "sentiment": string,  // exactamente: positivo, neutral o negativo
  "needsReply": boolean,
  "summary": string,    // resumen en español, máximo 2 frases
  "draft": string       // borrador de respuesta cordial en español; "" si no requiere respuesta
}
Reglas: "alta" = reclamos, temas urgentes o clientes molestos. "Proveedor" cubre
facturas, cuentas de cobro y órdenes de compra. No inventes datos que no estén en el correo.`

const SYNS = {
  factura: 'Proveedor', facturación: 'Proveedor', facturacion: 'Proveedor',
  cobro: 'Proveedor', pago: 'Proveedor', compra: 'Proveedor',
  queja: 'Reclamo', reclamación: 'Reclamo', 'pqr': 'Reclamo',
  cliente: 'Cliente nuevo', prospecto: 'Cliente nuevo', lead: 'Cliente nuevo',
  cotización: 'Cotización', cotizacion: 'Cotización', presupuesto: 'Cotización',
  boletín: 'Informativo', boletin: 'Informativo', newsletter: 'Informativo',
  notificación: 'Informativo', notificacion: 'Informativo', spam: 'Informativo',
  seguimiento: 'Seguimiento',
}

function normalizeCategory(value, fallback) {
  if (!value) return fallback
  const v = String(value).trim().toLowerCase()
  const exact = CATEGORIES.find((c) => c.toLowerCase() === v)
  if (exact) return exact
  for (const [k, cat] of Object.entries(SYNS)) if (v.includes(k)) return cat
  return fallback
}

const oneOf = (value, allowed, fallback) => {
  const v = String(value ?? '').trim().toLowerCase()
  return allowed.includes(v) ? v : fallback
}

// Enriquece un correo. Nunca lanza: si falla la IA, cae a reglas.
export async function classifyEmail(email) {
  const ruleCat = ruleCategory(email)
  const cat = ruleCat || 'Informativo'
  const base = {
    category: cat,
    priority: cat === 'Reclamo' ? 'alta' : 'media',
    sentiment: 'neutral',
    needsReply: cat !== 'Informativo',
    summary: (email.preview || '').slice(0, 200),
    draft: '',
  }

  if (!aiEnabled) return base

  try {
    const content = `Remitente: ${email.from_name || ''} <${email.from_email}>
Asunto: ${email.subject || '(sin asunto)'}
Cuerpo:
${(email.body_text || email.preview || '').slice(0, 4000)}`
    const out = JSON.parse(await chat({ system: SYSTEM, user: content, json: true }))
    const category = normalizeCategory(out.category, base.category)
    return {
      category,
      priority: oneOf(out.priority, ['alta', 'media', 'baja'], base.priority),
      sentiment: oneOf(out.sentiment, ['positivo', 'neutral', 'negativo'], 'neutral'),
      needsReply: Boolean(out.needsReply),
      summary: (out.summary || base.summary).slice(0, 500),
      draft: (out.draft || '').slice(0, 4000),
    }
  } catch (err) {
    console.error('classifyEmail: fallo IA, uso reglas —', err.message)
    return { ...base, aiFailed: true, rateLimited: /IA 429/.test(err.message) }
  }
}
