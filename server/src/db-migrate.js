import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'
import { BUILTIN_INTENTS } from './data/intents.js'

// Columnas añadidas después del esquema inicial. MySQL 8 no soporta
// "ADD COLUMN IF NOT EXISTS", así que ignoramos el error de columna duplicada.
const ALTERS = [
  'ALTER TABLE emails ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0',
  'ALTER TABLE emails ADD COLUMN flagged TINYINT(1) NOT NULL DEFAULT 0',
  "ALTER TABLE emails ADD COLUMN followup_checked TINYINT(1) NOT NULL DEFAULT 0",
]

async function applyAlters() {
  for (const sql of ALTERS) {
    try {
      await pool.query(sql)
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e
    }
  }
}

async function seedIntents() {
  for (const it of BUILTIN_INTENTS) {
    await pool.query(
      `INSERT INTO intents (intent_key, label, description, prompt_hint, is_builtin, sort_order)
       VALUES (?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         label = VALUES(label),
         description = VALUES(description),
         prompt_hint = VALUES(prompt_hint)`,
      [it.intent_key, it.label, it.description, it.prompt_hint, it.sort_order],
    )
  }
}

// Ejecuta schema.sql + ALTERs + semillas. Idempotente.
export async function runMigration() {
  const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))
  const raw = await readFile(schemaPath, 'utf8')
  const sql = raw.replace(/^\s*--.*$/gm, '')
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean)

  const applied = []
  for (const stmt of statements) {
    await pool.query(stmt)
    applied.push(stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] ?? stmt.slice(0, 40))
  }

  await applyAlters()
  await seedIntents()
  applied.push('alters', `intents(${BUILTIN_INTENTS.length} de fábrica)`)
  return applied
}
