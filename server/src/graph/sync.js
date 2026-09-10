import { query, getState, setState } from '../db.js'
import { config } from '../config.js'
import { getInboxDelta, getMessage } from './client.js'
import { classifyEmail } from '../ai/classify.js'
import { aiEnabled } from '../ai/llm.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function toMySQLDate(iso) {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ')
}

function normalize(msg) {
  const addr = msg.from?.emailAddress || msg.sender?.emailAddress || {}
  const fromEmail = (addr.address || 'desconocido@desconocido').toLowerCase()
  return {
    id: msg.id,
    conversation_id: msg.conversationId || null,
    received_at: toMySQLDate(msg.receivedDateTime),
    from_name: addr.name || null,
    from_email: fromEmail,
    subject: msg.subject || null,
    preview: msg.bodyPreview || null,
    body_text: typeof msg.body?.content === 'string' ? msg.body.content.slice(0, 8000) : null,
    web_link: msg.webLink || null,
    is_read: msg.isRead ? 1 : 0,
    from_owner: fromEmail === config.graph.mailbox.toLowerCase() ? 1 : 0,
  }
}

async function upsertContact(email, name, when) {
  await query(
    `INSERT INTO contacts (email, name, first_seen, last_seen, total_emails)
     VALUES (?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       name = COALESCE(VALUES(name), name),
       last_seen = GREATEST(last_seen, VALUES(last_seen)),
       total_emails = total_emails + 1`,
    [email, name, when, when],
  )
}

async function addInteraction(email, emailId, when, kind, description) {
  await query(
    `INSERT INTO interactions (contact_email, email_id, occurred_at, kind, description)
     VALUES (?, ?, ?, ?, ?)`,
    [email, emailId, when, kind, description],
  )
}

// Guarda un mensaje si es nuevo. Devuelve true si lo insertó.
async function saveMessage(msg) {
  const e = normalize(msg)
  const existing = await query('SELECT id FROM emails WHERE id = ?', [e.id])
  if (existing.length) {
    await query('UPDATE emails SET is_read = ? WHERE id = ?', [e.is_read, e.id])
    return false
  }

  await query(
    `INSERT INTO emails
       (id, conversation_id, received_at, from_name, from_email, subject,
        preview, body_text, web_link, is_read, from_owner, status, needs_reply)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      e.id, e.conversation_id, e.received_at, e.from_name, e.from_email, e.subject,
      e.preview, e.body_text, e.web_link, e.is_read, e.from_owner,
      e.from_owner ? 'respondido' : 'pendiente',
      e.from_owner ? 0 : 1,
    ],
  )

  if (!e.from_owner) {
    await upsertContact(e.from_email, e.from_name, e.received_at)
    await addInteraction(
      e.from_email, e.id, e.received_at, 'correo_entrante',
      `Correo recibido: ${e.subject || '(sin asunto)'}`,
    )
  }
  return true
}

// Clasifica los correos que aún no tienen enriched_at.
export async function classifyPending(limit = 20) {
  const rows = await query(
    `SELECT id, from_name, from_email, subject, preview, body_text
       FROM emails
      WHERE enriched_at IS NULL AND from_owner = 0
      ORDER BY received_at DESC
      LIMIT ${Number(limit)}`,
  )
  const rules = await query('SELECT * FROM rules WHERE active = 1 ORDER BY sort_order, id')

  for (const [i, row] of rows.entries()) {
    if (i > 0 && aiEnabled && config.ai.paceMs) await sleep(config.ai.paceMs)
    const r = await classifyEmail(row, rules)
    // Si la IA falló y cayó a reglas, no marcamos enriched_at: se reintenta luego.
    const mark = r.aiFailed ? 'enriched_at' : 'UTC_TIMESTAMP()'
    await query(
      `UPDATE emails SET category = ?, priority = ?, sentiment = ?, needs_reply = ?,
              ai_summary = ?, ai_draft = ?, archived = archived OR ?, enriched_at = ${mark}
       WHERE id = ?`,
      [r.category, r.priority, r.sentiment, r.needsReply ? 1 : 0, r.summary, r.draft, r.archive ? 1 : 0, row.id],
    )

    // Seguimiento detectado por la IA -> lo registramos (uno por correo).
    if (r.followup && !r.aiFailed) {
      const exists = await query('SELECT id FROM followups WHERE email_id = ? AND source = ?', [row.id, 'ia'])
      if (!exists.length) {
        const due =
          r.followup.dueInDays != null
            ? `DATE_ADD(CURDATE(), INTERVAL ${Number(r.followup.dueInDays)} DAY)`
            : 'NULL'
        await query(
          `INSERT INTO followups (email_id, contact_email, description, due_date, source)
           VALUES (?, ?, ?, ${due}, 'ia')`,
          [row.id, row.from_email, r.followup.description],
        )
      }
    }

    if (r.rateLimited) {
      console.warn('classifyPending: límite de la IA alcanzado, corto aquí')
      break
    }
  }
  return rows.length
}

// Sincronización incremental por delta query.
// classifyLimit = 0 -> solo trae correos, la clasificación queda para el cron.
export async function runSync({ classifyLimit = 30 } = {}) {
  const deltaLink = await getState('delta_link')
  const { messages, deltaLink: newDelta } = await getInboxDelta(deltaLink)

  let inserted = 0
  for (const msg of messages) {
    if (!msg.id) continue
    if (msg['@removed']) {
      await query('DELETE FROM emails WHERE id = ?', [msg.id])
      continue
    }
    if (await saveMessage(msg)) inserted++
  }

  if (newDelta) await setState('delta_link', newDelta)
  const classified = classifyLimit > 0 ? await classifyPending(classifyLimit) : 0

  return { received: messages.length, inserted, classified }
}

// Procesa una notificación del webhook (un id de mensaje).
export async function ingestMessageById(id) {
  const msg = await getMessage(id)
  const isNew = await saveMessage(msg)
  if (isNew) await classifyPending(5)
  return isNew
}
