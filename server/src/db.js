import mysql from 'mysql2/promise'
import { config } from './config.js'

// Pool único reutilizado por todo el backend.
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
  timezone: 'Z',
})

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function one(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] ?? null
}

// Clave/valor en la tabla app_state (delta link, id de suscripción, etc.)
export async function getState(key) {
  const row = await one('SELECT v FROM app_state WHERE k = ?', [key])
  return row ? row.v : null
}

export async function setState(key, value) {
  await query(
    'INSERT INTO app_state (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)',
    [key, value],
  )
}
