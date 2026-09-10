import { query, one } from '../db.js'
import { replyToMessage } from '../graph/client.js'

export async function getEmail(id) {
  return one('SELECT * FROM emails WHERE id = ?', [id])
}

export async function getContact(email) {
  const contact = await one('SELECT * FROM contacts WHERE email = ?', [email])
  const emails = await query(
    `SELECT id, received_at, subject, category, status, from_owner
       FROM emails WHERE from_email = ? OR (from_owner = 1 AND conversation_id IN
         (SELECT conversation_id FROM emails WHERE from_email = ?))
      ORDER BY received_at DESC LIMIT 50`,
    [email, email],
  )
  const timeline = await query(
    `SELECT occurred_at, kind, description FROM interactions
      WHERE contact_email = ? ORDER BY occurred_at ASC`,
    [email],
  )
  return { contact, emails, timeline }
}

// Cambia estado / categoría desde el panel (no toca el buzón).
export async function updateEmail(id, patch) {
  const fields = []
  const values = []
  if (patch.status && ['pendiente', 'en_espera', 'respondido', 'resuelto'].includes(patch.status)) {
    fields.push('status = ?')
    values.push(patch.status)
    if (patch.status === 'respondido' || patch.status === 'resuelto') {
      fields.push('needs_reply = 0')
    }
  }
  if (patch.category) {
    fields.push('category = ?')
    values.push(patch.category)
  }
  if (!fields.length) return getEmail(id)

  values.push(id)
  await query(`UPDATE emails SET ${fields.join(', ')} WHERE id = ?`, values)

  const email = await getEmail(id)
  if (patch.status) {
    await query(
      `INSERT INTO interactions (contact_email, email_id, occurred_at, kind, description)
       VALUES (?, ?, UTC_TIMESTAMP(), 'cambio_estado', ?)`,
      [email.from_email, id, `Estado cambiado a "${patch.status}"`],
    )
  }
  return email
}

// Envía la respuesta por Graph y marca el correo como respondido.
export async function sendReply(id, body) {
  const email = await getEmail(id)
  if (!email) throw new Error('Correo no encontrado')
  if (!body || !body.trim()) throw new Error('El cuerpo de la respuesta está vacío')

  await replyToMessage(id, body.trim())

  await query(
    `UPDATE emails SET status = 'respondido', needs_reply = 0, replied_at = UTC_TIMESTAMP() WHERE id = ?`,
    [id],
  )
  await query(
    `INSERT INTO interactions (contact_email, email_id, occurred_at, kind, description)
     VALUES (?, ?, UTC_TIMESTAMP(), 'respuesta_enviada', ?)`,
    [email.from_email, id, `Respuesta enviada: ${email.subject || '(sin asunto)'}`],
  )
  return getEmail(id)
}
