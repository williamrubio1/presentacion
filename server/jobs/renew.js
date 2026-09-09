// Renueva/crea la suscripción del webhook:  node jobs/renew.js
import { ensureSubscription } from '../src/graph/subscription.js'
import { pool } from '../src/db.js'

try {
  console.log('suscripción:', JSON.stringify(await ensureSubscription()))
} catch (e) {
  console.error('renew falló:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
