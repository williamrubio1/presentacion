import Reveal from '../Reveal.jsx'

const momentos = [
  {
    año: '2016',
    titulo: 'Los inicios',
    texto:
      'IFTTT, Zapier. Automatizaciones simples: si recibo correo, guárdalo. Mercado incipiente.',
  },
  {
    año: '2021',
    titulo: 'Hiperautomatización',
    texto:
      'Gartner proyecta $596B. RPA + IA. Territorio de grandes corporaciones.',
  },
  {
    año: '2026',
    titulo: 'Agentes de IA',
    texto:
      'Mercado de $1.04 billones (Gartner). 90% de grandes empresas priorizan hiperautomatización. Cualquier persona puede automatizar.',
  },
]

export default function Timeline() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Línea del tiempo
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Diez años que llevaron la automatización a manos de todos.
          </p>
        </Reveal>

        <div className="relative mt-14">
          <div className="absolute left-4 top-0 h-full w-px bg-slate-200 md:left-1/2" />
          <div className="space-y-10">
            {momentos.map((m, i) => (
              <Reveal
                key={m.año}
                delay={i * 120}
                className={`relative flex flex-col gap-3 pl-12 md:w-1/2 md:pl-0 ${
                  i % 2 === 0
                    ? 'md:mr-auto md:pr-12 md:text-right'
                    : 'md:ml-auto md:pl-12'
                }`}
              >
                <span
                  className={`absolute left-2 top-1 h-5 w-5 rounded-full border-4 border-white bg-[#4361ee] shadow md:left-auto ${
                    i % 2 === 0 ? 'md:-right-2.5' : 'md:-left-2.5'
                  }`}
                />
                <p className="text-2xl font-bold text-[#4361ee]">{m.año}</p>
                <h3 className="text-lg font-bold text-slate-900">{m.titulo}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {m.texto}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
