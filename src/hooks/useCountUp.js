import { useEffect, useRef, useState } from 'react'

// Anima un número desde 0 hasta `end` cuando `start` es true.
export function useCountUp(end, { duration = 1400, start = true } = {}) {
  const [value, setValue] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        setValue(end)
      }
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [end, duration, start])

  return value
}
