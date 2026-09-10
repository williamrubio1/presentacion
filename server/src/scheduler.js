import { getState, setState } from './db.js'
import { config } from './config.js'
import { runSync, classifyPending } from './graph/sync.js'
import { ensureSubscription } from './graph/subscription.js'
import { buildWeeklySummary } from './services/summary.js'

const MIN = 60_000

// Evita que dos instancias (o dos ticks) hagan el mismo trabajo a la vez.
async function withLock(key, ttlMs, fn) {
  const now = Date.now()
  const prev = Number((await getState(`lock_${key}`)) || 0)
  if (now - prev < ttlMs) return { skipped: 'lock' }
  await setState(`lock_${key}`, String(now))
  return fn()
}

function run(name, fn) {
  return Promise.resolve(fn())
    .then((r) => {
      if (r && !r.skipped) console.log(`[sched] ${name}:`, JSON.stringify(r))
    })
    .catch((e) => console.error(`[sched] ${name} falló:`, e.message))
}

// Programa sync / renovación del webhook / resumen dentro del propio servidor.
// Se puede apagar con DISABLE_SCHEDULER=1 (p. ej. si usas cron externo).
export function startScheduler() {
  if (process.env.DISABLE_SCHEDULER === '1') {
    console.log('Scheduler desactivado (DISABLE_SCHEDULER=1).')
    return
  }
  if (!config.graph.clientId) {
    console.log('Scheduler: Microsoft Graph no configurado, sin tareas programadas.')
    return
  }

  // pull = traer correos (rápido, segundos). classify = clasificar por lotes
  // pequeños con IA (más lento). Separados para que ningún tick se alargue.
  const pull = () => withLock('pull', 2 * MIN, () => runSync({ classifyLimit: 0 }))
  const classify = () => withLock('classify', 8 * MIN, () => classifyPending(8))

  setTimeout(() => {
    run('subscription', () => withLock('renew', 10 * MIN, ensureSubscription))
    run('pull inicial', pull)
  }, 15_000)

  setInterval(() => run('pull', pull), 3 * MIN)
  setInterval(() => run('classify', classify), 4 * MIN)
  setInterval(
    () => run('renew', () => withLock('renew', 90 * MIN, ensureSubscription)),
    2 * 60 * MIN,
  )
  setInterval(
    () => run('resumen', () => withLock('summary', 6 * 60 * MIN, buildWeeklySummary)),
    6 * 60 * MIN,
  )

  console.log('Scheduler activo: pull 3 min · clasificar 4 min · webhook 2 h · resumen 6 h.')
}
