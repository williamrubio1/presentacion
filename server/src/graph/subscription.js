import { getState, setState } from '../db.js'
import { config } from '../config.js'
import {
  createSubscription,
  renewSubscription,
  listSubscriptions,
  deleteSubscription,
} from './client.js'

// Crea la suscripción si no existe; si existe, la renueva.
export async function ensureSubscription() {
  if (!config.graph.webhookUrl) {
    return { skipped: 'GRAPH_WEBHOOK_URL no configurada' }
  }

  const storedId = await getState('subscription_id')

  if (storedId) {
    try {
      const sub = await renewSubscription(storedId)
      await setState('subscription_expires', sub.expirationDateTime)
      return { renewed: storedId, expires: sub.expirationDateTime }
    } catch (err) {
      console.warn('No se pudo renovar, recreo suscripción —', err.message)
    }
  }

  // Limpia suscripciones viejas hacia este mismo endpoint
  try {
    const subs = await listSubscriptions()
    for (const s of subs) {
      if (s.notificationUrl === config.graph.webhookUrl) await deleteSubscription(s.id)
    }
  } catch {
    /* ignora */
  }

  const sub = await createSubscription()
  await setState('subscription_id', sub.id)
  await setState('subscription_expires', sub.expirationDateTime)
  return { created: sub.id, expires: sub.expirationDateTime }
}
