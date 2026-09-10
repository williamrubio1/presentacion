import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

// Ejecuta schema.sql sentencia por sentencia. Idempotente.
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
  return applied
}
