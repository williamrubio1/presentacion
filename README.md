# presentacion.soluctiasas.com

Sitio de la charla sobre automatización de correo y procesos empresariales en la
Universidad de los Llanos (Villavicencio, Meta), y panel operativo real del
buzón de Soluctia SAS.

## Dos partes

| Carpeta | Qué es | Dónde vive |
|---|---|---|
| raíz | Frontend React + Vite (landing + panel) | Hostinger, estático (`public_html`) |
| `server/` | Backend Node + MySQL que conecta el buzón M365 | Hostinger, app Node (subdominio) |

El panel funciona en **modo demostración** con datos simulados si no hay
`VITE_API_URL`. Con backend, pide login y muestra el buzón real.

### Ver el buzón real en local

```bash
# 1. Backend (ver server/README.md para el .env con las credenciales)
cd server && npm install && npm run migrate && node jobs/sync.js && npm start

# 2. Frontend, en otra terminal
echo "VITE_API_URL=http://localhost:8787" > .env
npm run dev            # http://localhost:5173/dashboard  (contraseña: PANEL_PASSWORD)
```

El sitio **desplegado** en Hostinger seguirá en modo demo hasta que se despliegue
el backend (Fase 4) y se reconstruya `dist/` con `VITE_API_URL` apuntando a él.

## Frontend

```bash
npm install
npm run dev       # desarrollo
npm run build     # genera dist/
npm run lint
```

- `src/pages/Landing.jsx` — página de empresa
- `src/pages/Dashboard.jsx` — Centro de Mando
- `src/lib/dashboardData.js` — datos simulados + contrato
- `src/lib/api.js` — cliente del backend
- `src/hooks/useDashboardData.js` — carga, polling y acciones del panel
- `src/components/{landing,dashboard,layout}/*`

### Despliegue (estático)

1. Crea `.env` con `VITE_API_URL=https://api.presentacion.soluctiasas.com`
   (omítelo para dejar el panel en modo demostración).
2. `npm run build`
3. Sube `dist/` a `public_html/`. `dist/.htaccess` ya trae el fallback de SPA.

## Backend

Ver [`server/README.md`](server/README.md) — instalación, endpoints, despliegue
en Hostinger (Node.js + MySQL), cron jobs y registro de app en Entra ID.

## Integración con el correo

Ver [`docs/integracion-correo.md`](docs/integracion-correo.md) — arquitectura,
contrato de datos y fases (1 y 2 hechas; falta conectar Microsoft Graph).
