import { Sparkles } from 'lucide-react'
import { aiSummary } from '../../data/mockData.js'

export default function AISummary() {
  return (
    <div className="rounded-2xl border border-[#4361ee]/30 bg-gradient-to-br from-[#4361ee]/15 to-[#0b1120] p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#4361ee]/20 text-[#8ea2ff]">
          <Sparkles size={18} />
        </span>
        <h3 className="text-sm font-semibold text-white">{aiSummary.title}</h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {aiSummary.text}
      </p>
      <p className="mt-4 text-xs text-slate-500">
        Generado automáticamente · Requiere aprobación humana antes de enviar
      </p>
    </div>
  )
}
