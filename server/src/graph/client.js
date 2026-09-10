import { getGraphToken } from './auth.js'
import { config } from '../config.js'

const BASE = 'https://graph.microsoft.com/v1.0'
const mailbox = () => encodeURIComponent(config.graph.mailbox)

async function graphFetch(pathOrUrl, { method = 'GET', body, headers = {} } = {}) {
  const token = await getGraphToken()
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${BASE}${pathOrUrl}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`Graph ${res.status}: ${msg}`)
  }
  return data
}

const SELECT =
  'id,conversationId,receivedDateTime,subject,bodyPreview,body,from,isRead,webLink,sender,replyTo'

// Delta de la bandeja de entrada. Devuelve mensajes + el deltaLink siguiente.
export async function getInboxDelta(deltaLink) {
  const first =
    deltaLink ||
    `/users/${mailbox()}/mailFolders/inbox/messages/delta?$select=${SELECT}&$top=50`

  const messages = []
  let next = first
  let newDelta = null

  while (next) {
    const page = await graphFetch(next, {
      headers: { Prefer: 'outlook.body-content-type="text"' },
    })
    if (Array.isArray(page.value)) messages.push(...page.value)
    if (page['@odata.nextLink']) {
      next = page['@odata.nextLink']
    } else {
      next = null
      newDelta = page['@odata.deltaLink'] || null
    }
  }

  return { messages, deltaLink: newDelta }
}

export async function getMessage(id) {
  return graphFetch(`/users/${mailbox()}/messages/${id}?$select=${SELECT}`, {
    headers: { Prefer: 'outlook.body-content-type="text"' },
  })
}

// Responde a un correo. `toEmail` fuerza el destinatario (útil para correos
// del formulario web, cuyo remitente técnico es el propio buzón).
export async function replyToMessage(id, comment, toEmail) {
  await graphFetch(`/users/${mailbox()}/messages/${id}/reply`, {
    method: 'POST',
    body: {
      comment,
      ...(toEmail
        ? { message: { toRecipients: [{ emailAddress: { address: toEmail } }] } }
        : {}),
    },
  })
}

// Envía un correo desde el buzón (usado por el formulario de la web).
export async function sendMail({ subject, html, replyToEmail, replyToName }) {
  await graphFetch(`/users/${mailbox()}/sendMail`, {
    method: 'POST',
    body: {
      message: {
        subject,
        body: { contentType: 'HTML', content: html },
        toRecipients: [{ emailAddress: { address: config.graph.mailbox } }],
        ...(replyToEmail
          ? {
              replyTo: [
                { emailAddress: { address: replyToEmail, name: replyToName || replyToEmail } },
              ],
            }
          : {}),
      },
      saveToSentItems: false,
    },
  })
}

export async function setMessageRead(id, isRead) {
  await graphFetch(`/users/${mailbox()}/messages/${id}`, {
    method: 'PATCH',
    body: { isRead },
  })
}

export async function setMessageFlag(id, flagged) {
  await graphFetch(`/users/${mailbox()}/messages/${id}`, {
    method: 'PATCH',
    body: { flag: { flagStatus: flagged ? 'flagged' : 'notFlagged' } },
  })
}

// Mueve el mensaje a la carpeta Archivo (folder bien conocido de Graph).
export async function archiveMessage(id) {
  await graphFetch(`/users/${mailbox()}/messages/${id}/move`, {
    method: 'POST',
    body: { destinationId: 'archive' },
  })
}

export async function createSubscription() {
  const expirationDateTime = new Date(Date.now() + 60 * 60 * 1000 * 60).toISOString() // ~2.5 días
  return graphFetch('/subscriptions', {
    method: 'POST',
    body: {
      changeType: 'created',
      notificationUrl: config.graph.webhookUrl,
      resource: `/users/${config.graph.mailbox}/mailFolders('inbox')/messages`,
      expirationDateTime,
      clientState: config.graph.webhookSecret,
    },
  })
}

export async function renewSubscription(id) {
  const expirationDateTime = new Date(Date.now() + 60 * 60 * 1000 * 60).toISOString()
  return graphFetch(`/subscriptions/${id}`, {
    method: 'PATCH',
    body: { expirationDateTime },
  })
}

export async function listSubscriptions() {
  const data = await graphFetch('/subscriptions')
  return data?.value ?? []
}

export async function deleteSubscription(id) {
  await graphFetch(`/subscriptions/${id}`, { method: 'DELETE' })
}
