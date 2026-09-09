// Carga datos de ejemplo en MySQL para probar el panel sin conectar Graph.
//   node jobs/seed.js
import { pool, query } from '../src/db.js'

const now = new Date()
const at = (hoursAgo) =>
  new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')

const rows = [
  ['Carlos Méndez', 'carlos@distmendez.co', 'Distribuciones Méndez', 'Cotización servicio anual', 'Cotización', 'alta', 1, 'pendiente', 5,
   'Solicita cotización formal del plan anual antes del cierre de mes.',
   'Hola Carlos, gracias por tu interés. Adjunto la cotización del plan anual con la vigencia y el alcance acordados.'],
  ['María López', 'maria.lopez@agrometa.co', 'Agroindustrias del Meta', 'Re: Propuesta comercial', 'Cliente nuevo', 'media', 0, 'respondido', 26,
   'Confirma que la propuesta fue aprobada internamente.', ''],
  ['Proveedor TechCo', 'facturacion@techco.co', 'TechCo Colombia', 'Factura #4521', 'Proveedor', 'media', 0, 'respondido', 27,
   'Envía la factura #4521 del mes, pago a 30 días.', ''],
  ['Andrea Ruiz', 'andrea@comercialruiz.co', 'Comercial Ruiz & Cía', 'Queja servicio postventa', 'Reclamo', 'alta', 1, 'pendiente', 4,
   'Reclama demora de 3 días en la atención postventa. Pide contacto hoy.',
   'Andrea, lamento la demora. Ya escalé tu caso con prioridad y hoy mismo te contactamos con una solución.'],
  ['Jorge Salinas', 'jorge@transalinas.co', 'Transportes Salinas', 'Solicitud de información de planes', 'Cliente nuevo', 'media', 0, 'respondido', 9,
   'Pide comparativo de planes para una empresa de 5 personas.', ''],
  ['Cámara de Comercio', 'boletin@ccv.org.co', 'Cámara de Comercio de Villavicencio', 'Boletín mensual de afiliados', 'Informativo', 'baja', 0, 'respondido', 30,
   'Boletín informativo del mes. No requiere respuesta.', ''],
  ['Luisa Fernanda Parra', 'luisa@centauros.co', 'Clínica Los Centauros', 'Renovación de contrato de soporte', 'Cotización', 'media', 1, 'pendiente', 28,
   'Solicita cotización de renovación del contrato de soporte 2026-2027.',
   'Hola Luisa Fernanda, con gusto preparamos la renovación con las mismas condiciones y la nueva vigencia.'],
  ['Andrés Cortés', 'andres@hotelcampanario.co', 'Hotel Campanario', 'Reclamo por facturación duplicada', 'Reclamo', 'alta', 1, 'pendiente', 50,
   'Detecta un cobro duplicado en su factura y pide corrección.',
   'Andrés, gracias por avisar. Estamos revisando el cobro duplicado con contabilidad.'],
]

await query('DELETE FROM interactions')
await query('DELETE FROM emails')
await query('DELETE FROM contacts')

let i = 0
for (const r of rows) {
  const [name, email, company, subject, category, priority, needsReply, status, hoursAgo, summary, draft] = r
  const id = `seed-${++i}`
  const received = at(hoursAgo)
  await query(
    `INSERT INTO emails (id, conversation_id, received_at, from_name, from_email, subject,
        preview, body_text, web_link, is_read, from_owner, category, priority, sentiment,
        needs_reply, ai_summary, ai_draft, enriched_at, status, replied_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', 1, 0, ?, ?, 'neutral', ?, ?, ?, NOW(), ?, ?)`,
    [id, `conv-${i}`, received, name, email, subject, summary, summary,
     category, priority, needsReply, summary, draft, status,
     status === 'respondido' ? at(hoursAgo - 1) : null],
  )
  await query(
    `INSERT INTO contacts (email, name, company, first_seen, last_seen, total_emails)
     VALUES (?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE company = VALUES(company), last_seen = VALUES(last_seen)`,
    [email, name, company, received, received],
  )
  await query(
    `INSERT INTO interactions (contact_email, email_id, occurred_at, kind, description)
     VALUES (?, ?, ?, 'correo_entrante', ?)`,
    [email, id, received, `Correo recibido: ${subject}`],
  )
}

console.log(`Sembrados ${rows.length} correos de ejemplo.`)
await pool.end()
