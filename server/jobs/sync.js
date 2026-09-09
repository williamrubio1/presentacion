// Sincronización manual / por cron:  node jobs/sync.js
import { runSync } from '../src/graph/sync.js'
import { pool } from '../src/db.js'

try {
  const r = await runSync()
  console.log('sync:', JSON.stringify(r))
} catch (e) {
  console.error('sync falló:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
