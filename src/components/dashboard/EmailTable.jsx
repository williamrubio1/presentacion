import { categoryStyles, statusStyles, fallbackBadge } from '../../lib/badges.js'

export default function EmailTable({ emails = [], selected, onSelect }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1120]">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-sm font-semibold text-white">Correos recientes</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Haz clic en un remitente para ver su historial
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Hora</th>
              <th className="px-5 py-3 font-medium">Remitente</th>
              <th className="px-5 py-3 font-medium">Asunto</th>
              <th className="px-5 py-3 font-medium">Categoría</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((mail) => {
              const isSel = selected === mail.remitente
              return (
                <tr
                  key={mail.id}
                  onClick={() => onSelect(mail.remitente)}
                  className={`cursor-pointer border-t border-white/5 transition hover:bg-white/5 ${
                    isSel ? 'bg-[#4361ee]/10' : ''
                  } ${mail.estado === 'Urgente' ? 'blink-urgent' : ''}`}
                >
                  <td className="whitespace-nowrap px-5 py-3 text-slate-400">
                    {mail.hora}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-white">
                    {mail.remitente}
                  </td>
                  <td className="px-5 py-3 text-slate-300">{mail.asunto}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryStyles[mail.categoria] ?? fallbackBadge}`}
                    >
                      {mail.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[mail.estado] ?? statusStyles.Pendiente}`}
                    >
                      {mail.estado === 'Urgente' && (
                        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-red-600" />
                      )}
                      {mail.estado}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
