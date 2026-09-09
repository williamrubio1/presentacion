import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { config } from './config.js'

// Ejecuta schema.sql sentencia por sentencia. Idempotente (CREATE TABLE IF NOT EXISTS).
const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))

const raw = await readFile(schemaPath, 'utf8')
const sql = raw.replace(/^\s*--.*$/gm, '') // quita comentarios de línea
const statements = sql
  .split(/;\s*(?:\r?\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean)

const conn = await mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  multipleStatements: false,
})

for (const stmt of statements) {
  await conn.query(stmt)
  const name = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] ?? stmt.slice(0, 40)
  console.log('OK:', name)
}

await conn.end()
console.log('Migración completa.')
