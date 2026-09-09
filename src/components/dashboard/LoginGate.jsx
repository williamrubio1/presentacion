import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

export default function LoginGate({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onLogin(password)
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b1120] p-7"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#4361ee]/15 text-[#8ea2ff]">
          <Lock size={20} />
        </span>
        <h1 className="mt-4 text-lg font-bold text-white">Centro de Mando</h1>
        <p className="mt-1 text-sm text-slate-400">
          Ingresa la contraseña del panel para ver los datos del buzón.
        </p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="mt-5 w-full rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#4361ee]"
        />

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2.5 font-semibold text-white transition hover:bg-[#3651c8] disabled:opacity-50"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  )
}
