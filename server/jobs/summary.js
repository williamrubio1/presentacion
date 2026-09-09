// Regenera el resumen semanal de IA:  node jobs/summary.js
import { getOrBuildWeeklySummary } from '../src/services/summary.js'
import { pool } from '../src/db.js'

try {
  console.log(JSON.stringify(await getOrBuildWeeklySummary(), null, 2))
} catch (e) {
  console.error('summary falló:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
