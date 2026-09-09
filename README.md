# presentacion.soluctiasas.com

Sitio de demostración para la charla sobre automatización de correo y procesos
empresariales en la Universidad de los Llanos (Villavicencio, Meta).

## Stack

- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- react-router-dom (rutas `/` y `/dashboard`)
- recharts (gráfica de actividad)
- lucide-react (íconos)

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # genera dist/
npm run preview   # sirve dist/ localmente
npm run lint      # eslint
```

## Estructura

- `src/pages/Landing.jsx` — página de empresa (Soluctia SAS)
- `src/pages/Dashboard.jsx` — "Centro de Mando", demo en vivo con datos simulados
- `src/data/mockData.js` — toda la data del dashboard (estática)
- `src/components/landing/*` — secciones de la landing
- `src/components/dashboard/*` — widgets del dashboard
- `src/components/layout/*` — Navbar, Footer, DashboardHeader
- `src/hooks/*` — `useReveal` (animación al hacer scroll), `useCountUp` (conteo)

## Despliegue en Hostinger (sitio estático)

1. `npm run build`
2. Subir el contenido de `dist/` a `public_html/` del dominio
   `presentacion.soluctiasas.com`.
3. `dist/.htaccess` ya incluye el fallback de SPA para que `/dashboard`
   funcione al recargar la página.

Sin backend: el formulario de contacto y toda la data del dashboard son
simulados. No se usa `localStorage` ni `sessionStorage`.
