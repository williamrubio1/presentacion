import { query, one } from '../db.js'
import { CATEGORIES } from '../ai/classify-categories.js'

export const RULE_FIELDS = ['remitente', 'dominio', 'asunto', 'cuerpo']
export const RULE_OPS = ['contiene', 'igual', 'regex']
export const RULE_ACTIONS = ['categoria', 'prioridad', 'ignorar']

export async function listRules() {
  return query(
    `SELECT id, field, op, value, action, action_value, active, sort_order
       FROM rules ORDER BY sort_order, id`,
  )
}

function validate({ field, op, value, action, action_value }) {
  if (!RULE_FIELDS.includes(field)) throw new Error('Campo no válido')
  if (!RULE_OPS.includes(op)) throw new Error('Operador no válido')
  if (!value?.trim()) throw new Error('El valor es obligatorio')
  if (!RULE_ACTIONS.includes(action)) throw new Error('Acción no válida')
  if (action === 'categoria' && !CATEGORIES.includes(action_value)) {
    throw new Error('Categoría no válida')
  }
  if (action === 'prioridad' && !['alta', 'media', 'baja'].includes(action_value)) {
    throw new Error('Prioridad no válida')
  }
  if (op === 'regex') {
    try {
      new RegExp(value)
    } catch {
      throw new Error('Expresión regular inválida')
    }
  }
}

export async function createRule(data) {
  validate(data)
  const res = await query(
    `INSERT INTO rules (field, op, value, action, action_value, sort_order)
     VALUES (?, ?, ?, ?, ?, 100)`,
    [data.field, data.op, data.value.trim(), data.action, data.action_value || null],
  )
  return one('SELECT * FROM rules WHERE id = ?', [res.insertId])
}

export async function updateRule(id, patch) {
  if (patch.active !== undefined) {
    await query('UPDATE rules SET active = ? WHERE id = ?', [patch.active ? 1 : 0, id])
  }
  return one('SELECT * FROM rules WHERE id = ?', [id])
}

export async function deleteRule(id) {
  await query('DELETE FROM rules WHERE id = ?', [id])
}

function matches(rule, email) {
  const haystack = {
    remitente: `${email.from_name || ''} ${email.from_email || ''}`,
    dominio: (email.from_email || '').split('@')[1] || '',
    asunto: email.subject || '',
    cuerpo: email.body_text || email.preview || '',
  }[rule.field].toLowerCase()
  const needle = rule.value.toLowerCase()

  if (rule.op === 'contiene') return haystack.includes(needle)
  if (rule.op === 'igual') return haystack.trim() === needle
  if (rule.op === 'regex') {
    try {
      return new RegExp(rule.value, 'i').test(haystack)
    } catch {
      return false
    }
  }
  return false
}

// Aplica las reglas activas a un correo. Devuelve overrides (o null si nada aplica).
export async function applyRules(email, rules) {
  const list = rules || (await query('SELECT * FROM rules WHERE active = 1 ORDER BY sort_order, id'))
  const out = {}
  for (const rule of list) {
    if (!matches(rule, email)) continue
    if (rule.action === 'ignorar') return { ignore: true }
    if (rule.action === 'categoria') out.category = rule.action_value
    if (rule.action === 'prioridad') out.priority = rule.action_value
  }
  return Object.keys(out).length ? out : null
}
