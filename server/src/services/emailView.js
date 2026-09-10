// Convierte una fila de `emails` a la forma que consume el panel.

export function horaCO(d) {
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  })
}

export function estadoPanel(row) {
  if (row.status === 'respondido' || row.status === 'resuelto') return 'Respondido'
  if (row.priority === 'alta' && row.needs_reply) return 'Urgente'
  return 'Pendiente'
}

export function toPanelEmail(r) {
  return {
    id: r.id,
    hora: horaCO(r.received_at),
    receivedAt: new Date(r.received_at).toISOString(),
    remitente: r.from_name || r.from_email,
    email: r.from_email,
    empresa: r.company || '',
    asunto: r.subject || '(sin asunto)',
    categoria: r.category || 'Informativo',
    estado: estadoPanel(r),
    prioridad: r.priority,
    necesitaRespuesta: Boolean(r.needs_reply),
    resumen: r.ai_summary || '',
    borrador: r.ai_draft || '',
    webLink: r.web_link || '',
    leido: Boolean(r.is_read),
    marcado: Boolean(r.flagged),
    status: r.status,
  }
}
