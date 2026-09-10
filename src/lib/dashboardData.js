// ---------------------------------------------------------------------------
// Datos simulados del Centro de Mando (modo demostración, sin backend).
//
// Contrato (idéntico al que devuelve el backend en GET /api/dashboard):
//   {
//     metrics:   [{ id, label, value, suffix, display?, icon, tone }]
//     activity:  [{ dia, recibidos, respondidos }]
//     emails:    [{ id, hora, remitente, email, empresa, asunto, categoria,
//                   estado, resumen?, borrador? }]
//     timelines: { [remitente]: [{ fecha, evento }] }
//     alerts:    [{ id, tone: 'red'|'amber'|'green', text }]
//     aiSummary: { title, text }
//     updatedAt: ISO string
//   }
// ---------------------------------------------------------------------------

// --- Datos simulados -------------------------------------------------------

const metrics = [
  { id: 'correos-hoy', label: 'Correos hoy', value: 47, suffix: '', icon: 'Mail', tone: 'blue' },
  { id: 'sin-responder', label: 'Sin responder', value: 5, suffix: '', icon: 'AlertTriangle', tone: 'pending' },
  {
    id: 'tiempo-respuesta',
    label: 'Tiempo promedio de respuesta',
    value: 135,
    suffix: 'min',
    display: '2h 15min',
    icon: 'Clock',
    tone: 'dark',
  },
  { id: 'tasa-respuesta', label: 'Tasa de respuesta', value: 89, suffix: '%', icon: 'CheckCircle2', tone: 'positive' },
]

const activity = [
  { dia: 'Lun', recibidos: 52, respondidos: 48 },
  { dia: 'Mar', recibidos: 61, respondidos: 55 },
  { dia: 'Mié', recibidos: 44, respondidos: 42 },
  { dia: 'Jue', recibidos: 73, respondidos: 64 },
  { dia: 'Vie', recibidos: 58, respondidos: 53 },
  { dia: 'Sáb', recibidos: 21, respondidos: 19 },
  { dia: 'Dom', recibidos: 12, respondidos: 11 },
]

const emails = [
  {
    id: 1,
    hora: '9:15 AM',
    remitente: 'Carlos Méndez',
    empresa: 'Distribuciones Méndez',
    asunto: 'Cotización servicio anual',
    categoria: 'Cotización',
    estado: 'Pendiente',
    resumen: 'Solicita cotización formal del plan anual antes del cierre de mes.',
    borrador:
      'Hola Carlos, gracias por tu interés. Adjunto la cotización del plan anual con la vigencia y el alcance acordados. Quedo atento a tus comentarios.',
  },
  {
    id: 2,
    hora: '9:02 AM',
    remitente: 'María López',
    empresa: 'Agroindustrias del Meta',
    asunto: 'Re: Propuesta comercial',
    categoria: 'Cliente nuevo',
    estado: 'Respondido',
    resumen: 'Confirma que la propuesta fue aprobada internamente.',
  },
  {
    id: 3,
    hora: '8:45 AM',
    remitente: 'Proveedor TechCo',
    empresa: 'TechCo Colombia',
    asunto: 'Factura #4521',
    categoria: 'Proveedor',
    estado: 'Respondido',
    resumen: 'Envía la factura #4521 del mes, pago a 30 días.',
  },
  {
    id: 4,
    hora: '8:30 AM',
    remitente: 'Andrea Ruiz',
    empresa: 'Comercial Ruiz & Cía',
    asunto: 'Queja servicio postventa',
    categoria: 'Reclamo',
    estado: 'Urgente',
    resumen: 'Reclama demora de 3 días en la atención postventa. Pide contacto hoy.',
    borrador:
      'Andrea, lamento la demora. Ya escalé tu caso con prioridad y hoy mismo te contactamos con una solución. Gracias por tu paciencia.',
  },
  {
    id: 5,
    hora: '8:12 AM',
    remitente: 'Jorge Salinas',
    empresa: 'Transportes Salinas',
    asunto: 'Solicitud de información de planes',
    categoria: 'Cliente nuevo',
    estado: 'Respondido',
    resumen: 'Pide comparativo de planes para una empresa de 5 personas.',
  },
  {
    id: 6,
    hora: '7:58 AM',
    remitente: 'Cámara de Comercio',
    empresa: 'Cámara de Comercio de Villavicencio',
    asunto: 'Boletín mensual de afiliados',
    categoria: 'Informativo',
    estado: 'Respondido',
    resumen: 'Boletín informativo del mes. No requiere respuesta.',
  },
  {
    id: 7,
    hora: '7:41 AM',
    remitente: 'Luisa Fernanda Parra',
    empresa: 'Clínica Los Centauros',
    asunto: 'Renovación de contrato de soporte',
    categoria: 'Cotización',
    estado: 'Pendiente',
    resumen: 'Solicita cotización de renovación del contrato de soporte 2026-2027.',
    borrador:
      'Hola Luisa Fernanda, con gusto preparamos la renovación. Te envío la cotización con las mismas condiciones y la nueva vigencia para tu revisión.',
  },
  {
    id: 8,
    hora: '7:20 AM',
    remitente: 'Papelería Central',
    empresa: 'Papelería Central Ltda',
    asunto: 'Confirmación de pedido #882',
    categoria: 'Proveedor',
    estado: 'Respondido',
    resumen: 'Confirma el pedido #882 y fecha de entrega.',
  },
  {
    id: 9,
    hora: '6:55 AM',
    remitente: 'Andrés Cortés',
    empresa: 'Hotel Campanario',
    asunto: 'Reclamo por facturación duplicada',
    categoria: 'Reclamo',
    estado: 'Pendiente',
    resumen: 'Detecta un cobro duplicado en su factura y pide corrección.',
    borrador:
      'Andrés, gracias por avisar. Estamos revisando el cobro duplicado con contabilidad y te confirmamos el ajuste en las próximas horas.',
  },
  {
    id: 10,
    hora: '6:30 AM',
    remitente: 'Diana Gómez',
    empresa: 'Fundación Sembrar',
    asunto: 'Interés en automatización de donaciones',
    categoria: 'Cliente nuevo',
    estado: 'Respondido',
    resumen: 'Solicita propuesta para automatizar el flujo de donaciones.',
  },
]

const timelines = {
  'Carlos Méndez': [
    { fecha: '15 ago 2026', evento: 'Primer contacto: solicitud de información de servicios' },
    { fecha: '18 ago 2026', evento: 'Enviamos cotización del plan anual' },
    { fecha: '22 ago 2026', evento: 'Cliente solicita ajuste de precios y alcance' },
    { fecha: '25 ago 2026', evento: 'Cotización ajustada enviada' },
    { fecha: '01 sep 2026', evento: 'Cliente pide reunión para aprobar la orden' },
  ],
  'María López': [
    { fecha: '20 ago 2026', evento: 'Registro desde formulario web' },
    { fecha: '21 ago 2026', evento: 'Llamada de descubrimiento realizada' },
    { fecha: '27 ago 2026', evento: 'Propuesta comercial enviada' },
    { fecha: '05 sep 2026', evento: 'Cliente responde: propuesta aprobada' },
  ],
  'Andrea Ruiz': [
    { fecha: '10 jul 2026', evento: 'Compra de licencia de soporte' },
    { fecha: '28 ago 2026', evento: 'Reporta demora en atención postventa' },
    { fecha: '02 sep 2026', evento: 'Escala el caso por segunda vez' },
    { fecha: '09 sep 2026', evento: 'Reclamo sin responder — alerta activa' },
  ],
  'Proveedor TechCo': [
    { fecha: '01 ago 2026', evento: 'Orden de compra emitida (#4521)' },
    { fecha: '20 ago 2026', evento: 'Entrega parcial recibida' },
    { fecha: '05 sep 2026', evento: 'Factura #4521 recibida' },
    { fecha: '08 sep 2026', evento: 'Pago programado a 30 días' },
  ],
  'Jorge Salinas': [
    { fecha: '30 ago 2026', evento: 'Solicita información de planes por WhatsApp' },
    { fecha: '02 sep 2026', evento: 'Enviamos comparativo de planes' },
    { fecha: '06 sep 2026', evento: 'Cliente evalúa internamente' },
  ],
  'Luisa Fernanda Parra': [
    { fecha: '12 ago 2026', evento: 'Contrato de soporte firmado (2025-2026)' },
    { fecha: '01 sep 2026', evento: 'Recordatorio automático de renovación' },
    { fecha: '08 sep 2026', evento: 'Solicita cotización de renovación' },
  ],
  'Andrés Cortés': [
    { fecha: '18 ago 2026', evento: 'Alta como cliente — plan mensual' },
    { fecha: '03 sep 2026', evento: 'Detecta cobro duplicado en su factura' },
    { fecha: '07 sep 2026', evento: 'Reclamo abierto, en revisión con contabilidad' },
  ],
  'Diana Gómez': [
    { fecha: '25 ago 2026', evento: 'Asiste a webinar de automatización' },
    { fecha: '01 sep 2026', evento: 'Agenda demo personalizada' },
    { fecha: '04 sep 2026', evento: 'Solicita propuesta para flujo de donaciones' },
  ],
}

const alerts = [
  { id: 1, tone: 'red', text: 'Andrea Ruiz — Reclamo sin responder hace 4 horas' },
  { id: 2, tone: 'amber', text: 'Carlos Méndez — Cotización pendiente hace 2 días' },
  { id: 3, tone: 'green', text: 'Meta semanal cumplida: 89% tasa de respuesta' },
]

const aiSummary = {
  title: '📊 Resumen semanal generado por IA',
  text: 'Esta semana se recibieron 234 correos. Se respondieron 208 (89%). 3 clientes no han recibido respuesta en más de 48 horas: Andrea Ruiz, Carlos Méndez y TechCo Proveedores. La categoría con más volumen fue Cotizaciones (34%). Se recomienda priorizar los reclamos pendientes antes del cierre del día.',
}

const slug = (n) =>
  n
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '')

// Copia mutable para que las acciones de la demo (responder, resolver) se vean.
let state = null

function reset() {
  state = {
    metrics: metrics.map((m) => ({ ...m })),
    activity: activity.map((a) => ({ ...a })),
    emails: emails.map((e) => ({
      ...e,
      email: `${slug(e.remitente)}@ejemplo.co`,
      necesitaRespuesta: e.estado !== 'Respondido',
    })),
    timelines: JSON.parse(JSON.stringify(timelines)),
    alerts: alerts.map((a) => ({ ...a })),
    aiSummary: { ...aiSummary },
  }
}

// --- API pública (modo demostración) -----------------------------------

export async function getMockDashboard() {
  if (!state) reset()
  await new Promise((r) => setTimeout(r, 200))
  return { ...state, updatedAt: new Date().toISOString() }
}

export function mockReply(id) {
  if (!state) reset()
  const e = state.emails.find((x) => String(x.id) === String(id))
  if (e) {
    e.estado = 'Respondido'
    const t = state.timelines[e.remitente]
    if (t) t.push({ fecha: 'hoy', evento: `Respuesta enviada: ${e.asunto}` })
  }
}

export const MOCK_INTENTS = [
  { id: 1, label: 'Acuse de recibo', description: 'Confirmar recepción, sin comprometer nada' },
  { id: 2, label: 'Responder con información', description: 'Contestar la consulta' },
  { id: 3, label: 'Pedir más información', description: 'Solicitar los datos que faltan' },
  { id: 4, label: 'Ofrecer cotización', description: 'Confirmar que se enviará' },
  { id: 5, label: 'Proponer reunión', description: 'Sugerir horarios' },
  { id: 6, label: 'Declinar cortésmente', description: 'Rechazar amable' },
]

export function mockGenerateDraft(id, intentId, instruccion) {
  if (!state) reset()
  const e = state.emails.find((x) => String(x.id) === String(id))
  const it = MOCK_INTENTS.find((x) => x.id === intentId)
  const quien = e?.remitente?.split(' ')[0] || 'Hola'
  const extra = instruccion ? ` ${instruccion}.` : ''
  return Promise.resolve({
    draft: `Hola ${quien},\n\n[Demo · intención "${it?.label ?? '—'}"] Gracias por tu mensaje sobre "${e?.asunto ?? ''}".${extra}\n\nQuedamos atentos.\n\nEquipo Soluctia SAS`,
    intent: it?.label ?? null,
  })
}

export function mockUpdate(id, patch) {
  if (!state) reset()
  const e = state.emails.find((x) => String(x.id) === String(id))
  if (!e) return
  if (patch.status === 'resuelto') e.estado = 'Respondido'
  if (patch.status === 'pendiente') e.estado = 'Pendiente'
  if (patch.category) e.categoria = patch.category
}
