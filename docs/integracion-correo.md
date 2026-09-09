# Integración del panel con el buzón de correo

Objetivo: que `presentacion.soluctiasas.com/dashboard` funcione como panel de
decisión sobre un buzón de Microsoft 365 — correos clasificados, segmentados,
con acciones y actualización al llegar mensajes nuevos.

## Arquitectura (todo en Hostinger)

- **Frontend**: este repo raíz (React + Vite), estático en `public_html`.
- **Backend**: `server/` — Node.js (Express) como app Node de Hostinger, en un
  subdominio (`api.presentacion.soluctiasas.com`).
- **Base de datos**: MySQL del hosting.
- **Fuente**: Microsoft Graph (lectura del buzón, webhook, envío de respuestas).
- **IA**: OpenAI / Azure OpenAI (opcional) para categoría, resumen y borrador.

```
Buzón M365 → Graph (webhook) → server/ (reglas + IA) → MySQL
          → panel React (poll cada 30 s)
```

## Fases

| Fase | Entregable | Estado |
|---|---|---|
| 1 | Capa de datos en el frontend + contrato + modo mock/vivo | ✅ hecho |
| 2 | Backend Node + MySQL + endpoints + panel cableado (login, acciones) | ✅ hecho |
| 3 | Conectar Microsoft Graph: registro de app + `sync` del histórico | pendiente (necesita credenciales de Entra ID) |
| 4 | Webhook de Graph + cron de renovación (tiempo casi real) | pendiente |
| 5 | Endurecer: `ApplicationAccessPolicy`, secretos, pasar a la cuenta real | pendiente |

## Contrato de datos

`GET /api/dashboard` (y `getMockDashboard()` en modo demo) devuelven:

```
{
  metrics:   [{ id, label, value, suffix, display?, icon, tone }]
  activity:  [{ dia, recibidos, respondidos }]
  emails:    [{ id, hora, remitente, email, empresa, asunto, categoria,
                estado, resumen?, borrador?, webLink? }]
  timelines: { [remitente]: [{ fecha, evento }] }
  alerts:    [{ id, tone: 'red'|'amber'|'green', text }]
  aiSummary: { title, text }
  updatedAt: ISO string
}
```

- Sin `VITE_API_URL` → datos simulados (demo).
- Con `VITE_API_URL` → backend real; el panel pide login (`PANEL_PASSWORD`).

## Qué falta para el "en vivo" (Fase 3)

1. Registrar la app en Entra ID y conceder `Mail.Read`, `Mail.ReadWrite`,
   `Mail.Send` (permisos de aplicación).
2. Completar `MS_*` y `MAILBOX` en el `.env` del backend.
3. `npm run migrate` y `node jobs/sync.js` → trae y clasifica el histórico.
4. `node jobs/renew.js` → crea el webhook para el tiempo real.
5. Cron: `sync` cada 5 min, `renew` cada 2 h, `summary` semanal.

Ver `server/README.md` para el paso a paso de Hostinger.
