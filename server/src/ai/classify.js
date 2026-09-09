import { config } from '../config.js'

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
Devuelve SOLO un JSON con esta forma exacta:
{
  "category": una de ${JSON.stringify(CATEGORIES)},
  "priority": "alta" | "media" | "baja",
  "sentiment": "positivo" | "neutral" | "negativo",
  "needsReply": true | false,
  "summary": "resumen en español, máximo 2 frases",
  "draft": "borrador de respuesta cordial en español, o cadena vacía si no requiere respuesta"
}
"alta" = reclamos, temas urgentes o clientes molestos. No inventes datos que no estén en el correo.`

async function llmComplete(userContent) {
  const { provider } = config.ai
  let url
  let headers = { 'Content-Type': 'application/json' }
  let bodyModel = {}

  if (provider === 'openai') {
    url = 'https://api.openai.com/v1/chat/completions'
    headers.Authorization = `Bearer ${config.ai.openaiKey}`
    bodyModel = { model: config.ai.openaiModel }
  } else if (provider === 'azure') {
    url = `${config.ai.azureEndpoint}/openai/deployments/${config.ai.azureDeployment}/chat/completions?api-version=2024-08-01-preview`
    headers['api-key'] = config.ai.azureKey
  } else {
    return null
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...bodyModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userContent },
      ],
    }),
  })
  if (!res.ok) throw new Error(`IA ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

// Enriquece un correo. Nunca lanza: si falla la IA, cae a reglas.
export async function classifyEmail(email) {
  const ruleCat = ruleCategory(email)
  const base = {
    category: ruleCat || 'Informativo',
    priority: ruleCat === 'Reclamo' ? 'alta' : 'media',
    sentiment: 'neutral',
    needsReply: ruleCat !== 'Informativo',
    summary: (email.preview || '').slice(0, 200),
    draft: '',
  }

  if (config.ai.provider === 'none') return base

  try {
    const content = `Remitente: ${email.from_name || ''} <${email.from_email}>
Asunto: ${email.subject || '(sin asunto)'}
Cuerpo:
${(email.body_text || email.preview || '').slice(0, 4000)}`
    const out = await llmComplete(content)
    return {
      category: CATEGORIES.includes(out.category) ? out.category : base.category,
      priority: ['alta', 'media', 'baja'].includes(out.priority) ? out.priority : base.priority,
      sentiment: ['positivo', 'neutral', 'negativo'].includes(out.sentiment)
        ? out.sentiment
        : 'neutral',
      needsReply: Boolean(out.needsReply),
      summary: (out.summary || base.summary).slice(0, 500),
      draft: (out.draft || '').slice(0, 4000),
    }
  } catch (err) {
    console.error('classifyEmail: fallo IA, uso reglas —', err.message)
    return base
  }
}
