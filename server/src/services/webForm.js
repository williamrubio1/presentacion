import { sendMail } from '../graph/client.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// Límite simple en memoria: máx 5 envíos por IP por hora.
const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600_000)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) hits.clear()
  return arr.length > 5
}

export async function handleWebForm({ nombre, email, mensaje, website }, ip) {
  // Honeypot: si un bot rellena el campo oculto, aceptamos sin enviar.
  if (website) return { ok: true }

  nombre = String(nombre || '').trim().slice(0, 120)
  email = String(email || '').trim().slice(0, 200)
  mensaje = String(mensaje || '').trim().slice(0, 4000)

  if (!nombre || !mensaje) throw new Error('Faltan campos')
  if (!EMAIL_RE.test(email)) throw new Error('Correo no válido')
  if (rateLimited(ip)) throw new Error('Demasiados envíos. Intenta más tarde.')

  const html = `<p><b>Nuevo mensaje desde presentacion.soluctiasas.com</b></p>
<p><b>Nombre:</b> ${escape(nombre)}<br>
<b>Correo:</b> ${escape(email)}</p>
<hr>
<p style="white-space:pre-wrap">${escape(mensaje)}</p>`

  await sendMail({
    subject: `[Web] Contacto de ${nombre}`,
    html,
    replyToEmail: email,
    replyToName: nombre,
  })

  return { ok: true }
}
