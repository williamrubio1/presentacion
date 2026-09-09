import { config } from '../config.js'
import { ingestMessageById } from '../graph/sync.js'

// https://learn.microsoft.com/graph/webhooks
export async function handleGraphNotification(req, res) {
  // 1. Handshake de validación: Graph manda ?validationToken= y espera el eco.
  if (req.query.validationToken) {
    res.set('Content-Type', 'text/plain')
    return res.status(200).send(req.query.validationToken)
  }

  // 2. Notificaciones: responder 202 de inmediato y procesar en segundo plano.
  const notifications = Array.isArray(req.body?.value) ? req.body.value : []
  res.sendStatus(202)

  for (const n of notifications) {
    if (n.clientState !== config.graph.webhookSecret) {
      console.warn('Notificación con clientState inválido, ignorada')
      continue
    }
    const id = n.resourceData?.id
    if (!id) continue
    try {
      await ingestMessageById(id)
    } catch (err) {
      console.error('Error procesando notificación', id, '—', err.message)
    }
  }
}
