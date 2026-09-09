# Integración del panel con el buzón de correo

Objetivo: que `presentacion.soluctiasas.com/dashboard` funcione como panel de
decisión sobre un buzón de Microsoft 365 — correos clasificados, segmentados,
con acciones y actualización al llegar mensajes nuevos.

## Arquitectura

- **Frontend**: este repo (React + Vite), estático en Hostinger.
- **Backend**: Supabase (Postgres + Auth + Realtime + Edge Functions). Plan de
  Hostinger es hosting compartido, no corre backend.
- **Fuente**: Microsoft Graph (lectura del buzón, webhook al llegar correo,
  envío de respuestas).
- **IA**: OpenAI / Azure OpenAI para categoría, prioridad, resumen y borrador.

```
Buzón M365 → Graph (webhook) → Edge Function (reglas + IA) → Postgres
          → Supabase Realtime → panel React
```

## Fases

| Fase | Entregable | Estado |
|---|---|---|
| 1 | Capa de datos en el frontend + contrato + modo mock/vivo | ✅ hecho |
| 2 | Proyecto Supabase + esquema BD + app en Entra ID | pendiente |
| 3 | Edge Function: Graph → clasificar → poblar BD (histórico) | pendiente |
| 4 | Tiempo real (webhook Graph + Realtime) + alertas | pendiente |
| 5 | Acciones (responder con borrador + aprobar) + login | pendiente |

## Contrato de datos (Fase 1)

`getDashboardData()` en `src/lib/dashboardData.js` devuelve siempre:

```
{
  metrics:   [{ id, label, value, suffix, display?, icon, tone }]
  activity:  [{ dia, recibidos, respondidos }]
  emails:    [{ id, hora, remitente, empresa, asunto, categoria, estado,
                resumen?, borrador? }]
  timelines: { [remitente]: [{ fecha, evento }] }
  alerts:    [{ id, tone: 'red'|'amber'|'green', text }]
  aiSummary: { title, text }
  updatedAt: ISO string
}
```

- Sin `VITE_API_URL` → datos simulados (demo).
- Con `VITE_API_URL` → `GET {VITE_API_URL}/dashboard`.

El backend de la Fase 3 debe responder ese mismo JSON en `/dashboard`.
