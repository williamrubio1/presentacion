import { query, one } from '../db.js'

const slug = (s) =>
  'x_' +
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)

export async function listIntents({ onlyActive = false } = {}) {
  return query(
    `SELECT id, intent_key, label, description, prompt_hint, is_builtin, active, sort_order
       FROM intents
      ${onlyActive ? 'WHERE active = 1' : ''}
      ORDER BY sort_order, id`,
  )
}

export async function createIntent({ label, description, prompt_hint }) {
  if (!label?.trim() || !description?.trim()) {
    throw new Error('label y description son obligatorios')
  }
  let key = slug(label)
  if (await one('SELECT id FROM intents WHERE intent_key = ?', [key])) {
    key = `${key}_${Date.now().toString(36)}`
  }
  const res = await query(
    `INSERT INTO intents (intent_key, label, description, prompt_hint, is_builtin, sort_order)
     VALUES (?, ?, ?, ?, 0, 200)`,
    [key, label.trim(), description.trim(), (prompt_hint || '').trim()],
  )
  return one('SELECT * FROM intents WHERE id = ?', [res.insertId])
}

export async function updateIntent(id, patch) {
  const fields = []
  const values = []
  for (const k of ['label', 'description', 'prompt_hint']) {
    if (patch[k] !== undefined) {
      fields.push(`${k} = ?`)
      values.push(String(patch[k]).trim())
    }
  }
  if (patch.active !== undefined) {
    fields.push('active = ?')
    values.push(patch.active ? 1 : 0)
  }
  if (patch.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(Number(patch.sort_order))
  }
  if (!fields.length) return one('SELECT * FROM intents WHERE id = ?', [id])
  values.push(id)
  await query(`UPDATE intents SET ${fields.join(', ')} WHERE id = ?`, values)
  return one('SELECT * FROM intents WHERE id = ?', [id])
}

export async function deleteIntent(id) {
  const row = await one('SELECT is_builtin FROM intents WHERE id = ?', [id])
  if (!row) return
  if (row.is_builtin) {
    // Las de fábrica no se borran; se desactivan.
    await query('UPDATE intents SET active = 0 WHERE id = ?', [id])
  } else {
    await query('DELETE FROM intents WHERE id = ?', [id])
  }
}
