# Fase 4 — Despliegue en Hostinger

**Un solo deploy** (preset Express) sirve el frontend y la API desde
`presentacion.soluctiasas.com`. Mismo origen → sin CORS, sin subdominio.

```
npm install  →  npm run build (genera dist/)  →  npm start
                                                  └─ Express sirve dist/  +  /api/*
```

---

## 1. Base de datos MySQL

Ya creada:
- BD: `u154452028_presentacion` · Usuario: `u154452028_user` · Host: `localhost`

---

## 2. Configurar el deploy de GitHub

hPanel → deploy de GitHub del sitio `presentacion.soluctiasas.com`:

| Campo | Valor |
|---|---|
| Preajuste del marco | **Express** |
| Rama | `main` |
| Versión del nodo | 22.x |
| Directorio raíz | `.` (o vacío = raíz del repo) |
| Comando de compilación | `npm run build` |
| Gestor de paquetes | `npm` |
| Comando de inicio | `npm start` |

*(Si pide "Directorio de salida" en vez de comando de inicio, es porque quedó en
preset Vite — cámbialo a Express primero.)*

### Variables de entorno

En la sección **Variables de entorno** del deploy, agrega (rellena
`MYSQL_PASSWORD`, `PANEL_PASSWORD`, `MS_CLIENT_SECRET`, `GEMINI_API_KEY`):

```
PORT=3000
APP_ORIGIN=https://presentacion.soluctiasas.com,https://www.presentacion.soluctiasas.com
COOKIE_DOMAIN=
SESSION_SECRET=-t-sNPIWcvhzgciHHQ-K43uOfdF8hXzU
CRON_SECRET=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni
PANEL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=u154452028_user
MYSQL_PASSWORD=
MYSQL_DATABASE=u154452028_presentacion
MS_TENANT_ID=7aafda43-d81f-4b3a-b259-41bfa07f52db
MS_CLIENT_ID=4984ac51-18ca-47ae-a3dc-1d38e29b71f1
MS_CLIENT_SECRET=
MAILBOX=contacto@soluctiasas.com
GRAPH_WEBHOOK_URL=https://presentacion.soluctiasas.com/api/graph/notifications
GRAPH_WEBHOOK_SECRET=F6LXLALyuBb9iKIGs9r6E3ttNd32qnkO
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-lite-latest
AI_PACE_MS=0
RESPONSE_RATE_TARGET=85
```

Guarda y **vuelve a desplegar**.

---

## 3. Verificar el backend

`https://presentacion.soluctiasas.com/api/health` → `{"ok":true,...}`

---

## 4. Puesta en marcha (una URL, sin SSH)

```
https://presentacion.soluctiasas.com/api/cron/setup?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni
```

Crea las tablas + trae los ~50 correos + activa el webhook. Responde un JSON.
La clasificación con IA se completa con el cron (paso 5).

---

## 5. Cron

hPanel → **Trabajos Cron** si existe; si no, por **SSH** con `crontab -e`:

```
*/5 * * * *   curl -s "https://presentacion.soluctiasas.com/api/cron/sync?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"
0 */2 * * *   curl -s "https://presentacion.soluctiasas.com/api/cron/renew?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"
30 6 * * 1    curl -s "https://presentacion.soluctiasas.com/api/cron/summary?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"
```

Para clasificar el histórico ya (sin esperar al cron), llama varias veces:
`https://presentacion.soluctiasas.com/api/cron/classify?key=...&n=50`

---

## 6. Verificar el panel

1. `https://presentacion.soluctiasas.com/` → landing.
2. `https://presentacion.soluctiasas.com/dashboard` → pide contraseña (`PANEL_PASSWORD`).
3. Entra → **"Conectado al buzón — datos reales"** + los correos reales.
4. Envía un correo a `contacto@soluctiasas.com` → aparece en <1 min.

---

## Notas

- El frontend y el backend son el mismo proceso Node. Cada push redespliega
  ambos (`npm install` + `npm run build` + `npm start`).
- La suscripción de Graph dura ~3 días; el cron `renew` la mantiene.
- El resumen semanal con IA se genera en segundo plano; el panel nunca se
  queda esperando.
- **Seguridad**: rota `MS_CLIENT_SECRET` (el de pruebas quedó en el chat) y
  aplica la *Application Access Policy* en Exchange (ver `server/README.md`).

## Desarrollo local

```bash
# backend (necesita server/.env con MySQL y credenciales)
npm run migrate && npm run sync && npm start        # sirve todo en :8787

# o frontend con recarga en caliente, contra ese backend:
echo "VITE_API_URL=http://localhost:8787" > .env
npm run dev
```
