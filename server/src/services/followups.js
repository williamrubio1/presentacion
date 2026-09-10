import { query, one } from '../db.js'

// Seguimientos pendientes, ordenados por fecha (los sin fecha, al final).
export async function listFollowups({ includeDone = false } = {}) {
  const rows = await query(
    `SELECT f.id, f.email_id, f.contact_email, f.description, f.due_date, f.done, f.source,
            e.subject, e.from_name
       FROM followups f
       LEFT JOIN emails e ON e.id = f.email_id
      ${includeDone ? '' : 'WHERE f.done = 0'}
      ORDER BY f.done, f.due_date IS NULL, f.due_date, f.id`,
  )
  return rows.map((r) => ({
    id: r.id,
    descripcion: r.description,
    vence: r.due_date ? new Date(r.due_date).toISOString().slice(0, 10) : null,
    hecho: Boolean(r.done),
    fuente: r.source,
    contacto: r.from_name || r.contact_email || null,
    asunto: r.subject || null,
    emailId: r.email_id || null,
  }))
}

export async function createFollowup({ description, due_date, email_id, contact_email }) {
  if (!description?.trim()) throw new Error('La descripción es obligatoria')
  const res = await query(
    `INSERT INTO followups (email_id, contact_email, description, due_date, source)
     VALUES (?, ?, ?, ?, 'manual')`,
    [email_id || null, contact_email || null, description.trim(), due_date || null],
  )
  return one('SELECT * FROM followups WHERE id = ?', [res.insertId])
}

export async function updateFollowup(id, patch) {
  const fields = []
  const values = []
  if (patch.done !== undefined) {
    fields.push('done = ?')
    values.push(patch.done ? 1 : 0)
  }
  if (patch.description !== undefined) {
    fields.push('description = ?')
    values.push(String(patch.description).trim())
  }
  if (patch.due_date !== undefined) {
    fields.push('due_date = ?')
    values.push(patch.due_date || null)
  }
  if (!fields.length) return one('SELECT * FROM followups WHERE id = ?', [id])
  values.push(id)
  await query(`UPDATE followups SET ${fields.join(', ')} WHERE id = ?`, values)
  return one('SELECT * FROM followups WHERE id = ?', [id])
}

export async function deleteFollowup(id) {
  await query('DELETE FROM followups WHERE id = ?', [id])
}
