import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Mailbox } from 'lucide-react'

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1a1a2e]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#inicio" className="flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#4361ee]">
            <Mailbox size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            SOLUCTIA <span className="font-light text-slate-300">SAS</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="rounded-lg bg-[#4361ee] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3651c8]"
          >
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-white md:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-[#1a1a2e] px-5 pb-5 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-[#4361ee] px-3 py-2 text-center font-semibold text-white"
            >
              Ver Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
