import { Link } from 'react-router-dom'
import { Globe, AtSign, MessageCircle, Camera, Mailbox } from 'lucide-react'

const socials = [Globe, AtSign, MessageCircle, Camera]

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#4361ee]">
              <Mailbox size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              SOLUCTIA <span className="font-light text-slate-400">SAS</span>
            </span>
          </div>

          <div className="flex gap-3">
            {socials.map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Red social"
                className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 transition hover:bg-[#4361ee] hover:text-white"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Ver Dashboard en vivo →
          </Link>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          <p>© 2026 Soluctia SAS. Todos los derechos reservados.</p>
          <p className="mt-1">
            Presentación para la Universidad de los Llanos — Villavicencio, Meta
          </p>
        </div>
      </div>
    </footer>
  )
}
