import { query, one } from '../db.js'
import { chat, aiEnabled } from '../ai/llm.js'

const fecha = (d) =>
  d
    ? new Date(d).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Bogota',
      })
    : null

// Lista de contactos con actividad, ordenados por interacción más reciente.
export async function listContacts() {
  const rows = await query(
    `SELECT c.email, c.name, c.company, c.total_emails, c.last_seen, c.first_seen,
            (SELECT category FROM emails e WHERE e.from_email = c.email AND e.from_owner = 0
              ORDER BY e.received_at DESC LIMIT 1) AS ultima_categoria,
            (SELECT COUNT(*) FROM emails e WHERE e.from_email = c.email AND e.from_owner = 0
              AND e.needs_reply = 1 AND e.status IN ('pendiente','en_espera')) AS pendientes
       FROM contacts c
      WHERE c.total_emails > 0
      ORDER BY c.last_seen DESC`,
  )
  return rows.map((r) => ({
    email: r.email,
    nombre: r.name || r.email,
    empresa: r.company || '',
    total: r.total_emails,
    pendientes: Number(r.pendientes || 0),
    categoria: r.ultima_categoria || null,
    ultimoContacto: fecha(r.last_seen),
    primerContacto: fecha(r.first_seen),
  }))
}

async function conversationEmails(email) {
  return query(
    `SELECT id, received_at, subject, body_text, preview, from_owner, category, status
       FROM emails
      WHERE from_email = ?
         OR (from_owner = 1 AND conversation_id IN
              (SELECT conversation_id FROM emails WHERE from_email = ?))
      ORDER BY received_at ASC
      LIMIT 60`,
    [email, email],
  )
}

function buildTranscript(emails) {
  return emails
    .map((e) => {
      const quien = e.from_owner ? 'NOSOTROS' : 'ELLOS'
      const cuerpo = (e.body_text || e.preview || '').replace(/\s+/g, ' ').slice(0, 600)
      const f = new Date(e.received_at).toISOString().slice(0, 10)
      return `[${f}] ${quien} — ${e.subject || '(sin asunto)'}\n${cuerpo}`
    })
    .join('\n\n')
}

async function generateSummary(email, emails) {
  const nombre = (await one('SELECT name FROM contacts WHERE email = ?', [email]))?.name || email

  if (!aiEnabled || emails.length === 0) {
    return {
      summary: emails.length
        ? `${emails.length} correos con ${nombre}. Activa la IA para el resumen.`
        : 'Sin correos.',
      estado: null,
      quien_responde: null,
    }
  }

  const system = `Resumes la relación por correo con un contacto, para un panel de gestión.
Devuelve SOLO un JSON:
{
  "estado": "una frase: en qué punto está la relación/negociación ahora",
  "resumen": "3 a 6 frases: qué se ha hablado, temas abiertos o pendientes, último movimiento y qué sigue",
  "quienResponde": "nosotros" | "ellos" | "nadie"   // quién tiene la pelota ahora
}
No inventes datos. Escribe en español, tono ejecutivo.`

  const user = `Contacto: ${nombre} <${email}>
Historial de correos (orden cronológico, NOSOTROS = el buzón, ELLOS = el contacto):

${buildTranscript(emails).slice(0, 12000)}`

  try {
    const out = JSON.parse(await chat({ system, user, json: true, temperature: 0.3 }))
    return {
      summary: String(out.resumen || '').slice(0, 2000),
      estado: String(out.estado || '').slice(0, 255) || null,
      quien_responde: ['nosotros', 'ellos', 'nadie'].includes(out.quienResponde)
        ? out.quienResponde
        : null,
    }
  } catch (e) {
    console.error('generateSummary:', e.message)
    return { summary: `No se pudo generar el resumen (${e.message}).`, estado: null, quien_responde: null }
  }
}

async function storeSummary(email, s, lastEmailAt) {
  await query(
    `INSERT INTO contact_summaries (contact_email, summary, estado, quien_responde, last_email_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE summary = VALUES(summary), estado = VALUES(estado),
       quien_responde = VALUES(quien_responde), last_email_at = VALUES(last_email_at),
       updated_at = UTC_TIMESTAMP()`,
    [email, s.summary, s.estado, s.quien_responde, lastEmailAt],
  )
}

// Detalle de un contacto: datos + resumen IA (cacheado) + correos + timeline.
export async function getContactDetail(email, { force = false } = {}) {
  const contact = await one('SELECT * FROM contacts WHERE email = ?', [email])
  const emails = await conversationEmails(email)
  const lastEmailAt = emails.length
    ? new Date(emails[emails.length - 1].received_at).toISOString().slice(0, 19).replace('T', ' ')
    : null

  const cached = await one('SELECT * FROM contact_summaries WHERE contact_email = ?', [email])
  const stale =
    force ||
    !cached ||
    (lastEmailAt && (!cached.last_email_at || new Date(cached.last_email_at) < new Date(lastEmailAt)))

  let s
  if (cached && !stale) {
    s = { summary: cached.summary, estado: cached.estado, quien_responde: cached.quien_responde }
  } else if (cached && stale) {
    // Devolvemos el viejo y regeneramos en segundo plano.
    s = { summary: cached.summary, estado: cached.estado, quien_responde: cached.quien_responde }
    generateSummary(email, emails)
      .then((fresh) => storeSummary(email, fresh, lastEmailAt))
      .catch(() => {})
  } else {
    s = await generateSummary(email, emails)
    await storeSummary(email, s, lastEmailAt)
  }

  const timeline = await query(
    `SELECT occurred_at, kind, description FROM interactions
      WHERE contact_email = ? ORDER BY occurred_at ASC`,
    [email],
  )

  return {
    contacto: {
      email,
      nombre: contact?.name || email,
      empresa: contact?.company || '',
      total: contact?.total_emails || emails.length,
      primerContacto: fecha(contact?.first_seen),
      ultimoContacto: fecha(contact?.last_seen),
    },
    estado: s.estado,
    quienResponde: s.quien_responde,
    resumen: s.summary,
    resumenDesactualizado: Boolean(cached && stale),
    correos: emails
      .slice()
      .reverse()
      .map((e) => ({
        id: e.id,
        fecha: fecha(e.received_at),
        asunto: e.subject || '(sin asunto)',
        direccion: e.from_owner ? 'enviado' : 'recibido',
        categoria: e.category || null,
        estado: e.status,
      })),
    timeline: timeline.map((t) => ({
      fecha: fecha(t.occurred_at),
      evento: t.description,
    })),
  }
}
