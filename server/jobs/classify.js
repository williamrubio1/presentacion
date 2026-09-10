// Clasifica correos pendientes.  node jobs/classify.js [n]
// Con --all, primero borra el enriquecimiento para reprocesar todo
// (útil al cambiar de proveedor de IA).
import { query } from '../src/db.js'
import { classifyPending } from '../src/graph/sync.js'
import { pool } from '../src/db.js'

const all = process.argv.includes('--all')
const n = Number(process.argv.find((a) => /^\d+$/.test(a))) || (all ? 500 : 30)

try {
  if (all) {
    await query('UPDATE emails SET enriched_at = NULL WHERE from_owner = 0')
    console.log('enriched_at reiniciado en todos los correos')
  }
  console.log('clasificados:', await classifyPending(n))
} catch (e) {
  console.error('classify falló:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
