// Datos simulados para la demo del Centro de Mando de Soluctia SAS.
// Nada de esto consulta un backend real: son ejemplos realistas de una PYME colombiana.

export const metrics = [
  {
    id: 'correos-hoy',
    label: 'Correos hoy',
    value: 47,
    suffix: '',
    icon: 'Mail',
    tone: 'blue',
  },
  {
    id: 'sin-responder',
    label: 'Sin responder',
    value: 5,
    suffix: '',
    icon: 'AlertTriangle',
    tone: 'pending',
  },
  {
    id: 'tiempo-respuesta',
    label: 'Tiempo promedio de respuesta',
    value: 135,
    suffix: 'min',
    display: '2h 15min',
    icon: 'Clock',
    tone: 'dark',
  },
  {
    id: 'tasa-respuesta',
    label: 'Tasa de respuesta',
    value: 89,
    suffix: '%',
    icon: 'CheckCircle2',
    tone: 'positive',
  },
]

export const activity7d = [
  { dia: 'Lun', recibidos: 52, respondidos: 48 },
  { dia: 'Mar', recibidos: 61, respondidos: 55 },
  { dia: 'Mié', recibidos: 44, respondidos: 42 },
  { dia: 'Jue', recibidos: 73, respondidos: 64 },
  { dia: 'Vie', recibidos: 58, respondidos: 53 },
  { dia: 'Sáb', recibidos: 21, respondidos: 19 },
  { dia: 'Dom', recibidos: 12, respondidos: 11 },
]

export const categoryStyles = {
  'Cliente nuevo': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Cotización: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  Reclamo: 'bg-red-100 text-red-700 ring-red-600/20',
  Informativo: 'bg-slate-200 text-slate-600 ring-slate-500/20',
  Proveedor: 'bg-purple-100 text-purple-700 ring-purple-600/20',
}

export const statusStyles = {
  Respondido: 'bg-emerald-100 text-emerald-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  Urgente: 'bg-red-100 text-red-700',
}

export const emails = [
  {
    id: 1,
    hora: '9:15 AM',
    remitente: 'Carlos Méndez',
    empresa: 'Distribuciones Méndez',
    asunto: 'Cotización servicio anual',
    categoria: 'Cotización',
    estado: 'Pendiente',
  },
  {
    id: 2,
    hora: '9:02 AM',
    remitente: 'María López',
    empresa: 'Agroindustrias del Meta',
    asunto: 'Re: Propuesta comercial',
    categoria: 'Cliente nuevo',
    estado: 'Respondido',
  },
  {
    id: 3,
    hora: '8:45 AM',
    remitente: 'Proveedor TechCo',
    empresa: 'TechCo Colombia',
    asunto: 'Factura #4521',
    categoria: 'Proveedor',
    estado: 'Respondido',
  },
  {
    id: 4,
    hora: '8:30 AM',
    remitente: 'Andrea Ruiz',
    empresa: 'Comercial Ruiz & Cía',
    asunto: 'Queja servicio postventa',
    categoria: 'Reclamo',
    estado: 'Urgente',
  },
  {
    id: 5,
    hora: '8:12 AM',
    remitente: 'Jorge Salinas',
    empresa: 'Transportes Salinas',
    asunto: 'Solicitud de información de planes',
    categoria: 'Cliente nuevo',
    estado: 'Respondido',
  },
  {
    id: 6,
    hora: '7:58 AM',
    remitente: 'Cámara de Comercio',
    empresa: 'Cámara de Comercio de Villavicencio',
    asunto: 'Boletín mensual de afiliados',
    categoria: 'Informativo',
    estado: 'Respondido',
  },
  {
    id: 7,
    hora: '7:41 AM',
    remitente: 'Luisa Fernanda Parra',
    empresa: 'Clínica Los Centauros',
    asunto: 'Renovación de contrato de soporte',
    categoria: 'Cotización',
    estado: 'Pendiente',
  },
  {
    id: 8,
    hora: '7:20 AM',
    remitente: 'Papelería Central',
    empresa: 'Papelería Central Ltda',
    asunto: 'Confirmación de pedido #882',
    categoria: 'Proveedor',
    estado: 'Respondido',
  },
  {
    id: 9,
    hora: '6:55 AM',
    remitente: 'Andrés Cortés',
    empresa: 'Hotel Campanario',
    asunto: 'Reclamo por facturación duplicada',
    categoria: 'Reclamo',
    estado: 'Pendiente',
  },
  {
    id: 10,
    hora: '6:30 AM',
    remitente: 'Diana Gómez',
    empresa: 'Fundación Sembrar',
    asunto: 'Interés en automatización de donaciones',
    categoria: 'Cliente nuevo',
    estado: 'Respondido',
  },
]

// Historial de interacciones por remitente para el "Timeline del cliente".
export const clientTimelines = {
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

export const alerts = [
  {
    id: 1,
    tone: 'red',
    text: 'Andrea Ruiz — Reclamo sin responder hace 4 horas',
  },
  {
    id: 2,
    tone: 'amber',
    text: 'Carlos Méndez — Cotización pendiente hace 2 días',
  },
  {
    id: 3,
    tone: 'green',
    text: 'Meta semanal cumplida: 89% tasa de respuesta',
  },
]

export const aiSummary = {
  title: '📊 Resumen semanal generado por IA',
  text: 'Esta semana se recibieron 234 correos. Se respondieron 208 (89%). 3 clientes no han recibido respuesta en más de 48 horas: Andrea Ruiz, Carlos Méndez y TechCo Proveedores. La categoría con más volumen fue Cotizaciones (34%). Se recomienda priorizar los reclamos pendientes antes del cierre del día.',
}
