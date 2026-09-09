import { useReveal } from '../hooks/useReveal.js'

// Envuelve contenido para animarlo al entrar en pantalla.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const { ref, visible } = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
