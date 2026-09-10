import { chat, aiEnabled } from './llm.js'
import { CATEGORIES } from './classify-categories.js'
import { applyRules } from '../services/rules.js'

export { CATEGORIES }

// --- Reglas rápidas de fábrica (respaldo si la IA falla) --------------

const FALLBACK_RULES = [
  { cat: 'Reclamo', re: /\b(queja|reclamo|inconformidad|molesto|pésimo|no funciona|demora|tardan)\b/i },
  { cat: 'Cotización', re: /\b(cotizaci[oó]n|cotizar|presupuesto|precio|tarifa|propuesta económica)\b/i },
  { cat: 'Proveedor', re: /\b(factura|remisi[oó]n|orden de compra|pago|nómina|cuenta de cobro)\b/i },
  { cat: 'Informativo', re: /\b(bolet[ií]n|newsletter|novedades|no responder|notificaci[oó]n autom)\b/i },
  { cat: 'Seguimiento', re: /^\s*re:|\b(seguimiento|recordatorio|quedamos|como acordamos)\b/i },
]

function ruleCategory({ subject = '', preview = '' }) {
  const text = `${subject}\n${preview}`
  for (const r of FALLBACK_RULES) if (r.re.test(text)) return r.cat
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
  "draft": string,      // borrador de respuesta cordial en español; "" si no requiere respuesta
  "followup": { "needed": boolean, "description": string, "dueInDays": number|null }
}
Reglas:
- "alta" = reclamos, temas urgentes o clientes molestos.
- "Proveedor" cubre facturas, cuentas de cobro y órdenes de compra.
- needsReply = false para notificaciones automáticas, boletines, confirmaciones de
  registro/inicio de sesión, códigos de verificación, publicidad y correos de "no responder".
  needsReply = true solo si una persona espera una respuesta nuestra.
- Si needsReply = false, "draft" debe ser "".
- followup.needed = true SOLO si el correo implica que NOSOTROS (Soluctia) debemos
  hacer algo concreto después (enviar un documento, pagar, revisar, llamar…).
  description = qué debemos hacer, en imperativo y breve. dueInDays = en cuántos días
  como máximo, o null si no hay fecha.
- No inventes datos que no estén en el correo.`

const SYNS = {
  factura: 'Proveedor', facturación: 'Proveedor', facturacion: 'Proveedor',
  cobro: 'Proveedor', pago: 'Proveedor', compra: 'Proveedor',
  queja: 'Reclamo', reclamación: 'Reclamo', pqr: 'Reclamo',
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
// `rules` opcional: lista de reglas ya cargadas (para no consultar por cada correo).
export async function classifyEmail(email, rules) {
  // 1. Reglas configurables del usuario (tienen prioridad).
  const override = await applyRules(email, rules).catch(() => null)
  if (override?.ignore) {
    return {
      category: 'Ignorado',
      priority: 'baja',
      sentiment: 'neutral',
      needsReply: false,
      summary: 'Ignorado por una regla.',
      draft: '',
      archive: true,
    }
  }

  const ruleCat = override?.category || ruleCategory(email)
  const cat = ruleCat || 'Informativo'
  const base = {
    category: cat,
    priority: override?.priority || (cat === 'Reclamo' ? 'alta' : 'media'),
    sentiment: 'neutral',
    needsReply: cat !== 'Informativo' && cat !== 'Ignorado',
    summary: (email.preview || '').slice(0, 200),
    draft: '',
    followup: null,
  }

  if (!aiEnabled) return base

  try {
    const content = `Remitente: ${email.from_name || ''} <${email.from_email}>
Asunto: ${email.subject || '(sin asunto)'}
Cuerpo:
${(email.body_text || email.preview || '').slice(0, 4000)}`
    const out = JSON.parse(await chat({ system: SYSTEM, user: content, json: true }))
    const fu = out.followup
    return {
      category: override?.category || normalizeCategory(out.category, base.category),
      priority: override?.priority || oneOf(out.priority, ['alta', 'media', 'baja'], base.priority),
      sentiment: oneOf(out.sentiment, ['positivo', 'neutral', 'negativo'], 'neutral'),
      needsReply: Boolean(out.needsReply),
      summary: (out.summary || base.summary).slice(0, 500),
      draft: (out.draft || '').slice(0, 4000),
      followup:
        fu && fu.needed && fu.description
          ? {
              description: String(fu.description).slice(0, 500),
              dueInDays: Number.isFinite(fu.dueInDays) ? Math.max(0, Math.round(fu.dueInDays)) : null,
            }
          : null,
    }
  } catch (err) {
    console.error('classifyEmail: fallo IA, uso reglas —', err.message)
    return { ...base, aiFailed: true, rateLimited: /IA 429/.test(err.message) }
  }
}
