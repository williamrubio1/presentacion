import { MousePointerClick } from 'lucide-react'

export default function ClientTimeline({ cliente, eventos }) {

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
      <h3 className="text-sm font-semibold text-white">Timeline del cliente</h3>

      {!eventos ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-slate-500">
          <MousePointerClick size={28} />
          <p className="text-sm">
            Selecciona un remitente en la tabla para ver todas sus interacciones.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-1 text-xs text-slate-400">
            Historial de <span className="text-slate-200">{cliente}</span>
          </p>
          <ol className="mt-5 space-y-0">
            {eventos.map((ev, i) => (
              <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4361ee]" />
                  {i < eventos.length - 1 && (
                    <span className="w-px flex-1 bg-white/10" />
                  )}
                </div>
                <div className="-mt-0.5">
                  <p className="text-xs font-semibold text-[#8ea2ff]">
                    {ev.fecha}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-300">{ev.evento}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
