# presentacion.soluctiasas.com

Sitio de la charla sobre automatización de correo y procesos empresariales en la
Universidad de los Llanos (Villavicencio, Meta), y panel operativo real del
buzón `contacto@soluctiasas.com`.

## Arquitectura

Un solo proceso Node (Express) sirve **el frontend compilado y la API** desde el
mismo origen:

```
raíz/          Frontend React + Vite  ->  se compila a dist/
server/        Backend Express + MySQL + Microsoft Graph + IA (Gemini)
               -> server/src/index.js sirve dist/  +  /api/*
```

El panel funciona en **modo demostración** (datos simulados) si `VITE_API_URL`
no está definida al compilar. En producción se compila con `.env.production`
(`VITE_API_URL` vacía = mismo origen) y muestra el buzón real tras login.

## Scripts (todos desde la raíz)

```bash
npm install
npm run dev        # frontend con HMR (Vite)
npm run build      # genera dist/
npm start          # servidor: sirve dist/ + API en :8787
npm run lint

npm run migrate    # crea las tablas MySQL
npm run sync       # trae y clasifica el buzón
npm run renew      # crea/renueva el webhook de Graph
npm run summary    # regenera el resumen semanal de IA
npm run classify   # clasifica correos pendientes  (--all para reprocesar)
```

## Desarrollo local

```bash
# 1. crea server/.env  (ver server/.env.example: MySQL + credenciales de Graph + Gemini)
npm run migrate && npm run sync
npm start                       # todo servido en http://localhost:8787

# alternativa con recarga del frontend:
echo "VITE_API_URL=http://localhost:8787" > .env
npm run dev                     # http://localhost:5173  (proxy al backend en :8787)
```

## Documentación

- [`docs/despliegue-hostinger.md`](docs/despliegue-hostinger.md) — despliegue (preset Express).
- [`docs/integracion-correo.md`](docs/integracion-correo.md) — arquitectura y contrato de datos.
- [`server/README.md`](server/README.md) — endpoints, IA, registro de app en Entra ID.
