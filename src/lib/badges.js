// Estilos de badge por categoría y estado. Son presentación, no datos.

export const categoryStyles = {
  'Cliente nuevo': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Cotización: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  Reclamo: 'bg-red-100 text-red-700 ring-red-600/20',
  Informativo: 'bg-slate-200 text-slate-600 ring-slate-500/20',
  Proveedor: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  Seguimiento: 'bg-amber-100 text-amber-700 ring-amber-600/20',
}

export const statusStyles = {
  Respondido: 'bg-emerald-100 text-emerald-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  Urgente: 'bg-red-100 text-red-700',
  Resuelto: 'bg-slate-200 text-slate-600',
}

// Fallback para categorías o estados que aún no tengan estilo definido.
export const fallbackBadge = 'bg-slate-200 text-slate-600 ring-slate-500/20'
