// CLI:  npm run migrate
import { runMigration } from './db-migrate.js'
import { pool } from './db.js'

try {
  const applied = await runMigration()
  applied.forEach((t) => console.log('OK:', t))
  console.log('Migración completa.')
} finally {
  await pool.end()
}
