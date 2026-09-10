# Backend — Centro de Mando

API Node.js (Express) que conecta el buzón de Microsoft 365 con el panel
`presentacion.soluctiasas.com/dashboard`. Base de datos MySQL.

```
Buzón M365 ──▶ Graph (webhook) ──▶ este backend ──▶ MySQL ──▶ panel (poll 30s)
```

## Qué hace

- Lee la bandeja de entrada por **Microsoft Graph** (delta query + webhook).
- **Clasifica** cada correo: reglas rápidas + IA opcional (categoría, prioridad,
  sentimiento, resumen, borrador de respuesta).
- Guarda todo en MySQL y expone `GET /api/dashboard` con el contrato del panel.
- Permite **responder** desde el panel (sale del buzón real) y marcar estados.
- Genera un **resumen semanal** con IA.

## Endpoints

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/login` | `{ password }` → cookie de sesión |
| POST | `/api/logout` | cierra sesión |
| GET | `/api/me` | estado de sesión |
| GET | `/api/dashboard` | datos del panel (auth) |
| GET | `/api/contacts/:email` | historial de un contacto (auth) |
| PATCH | `/api/emails/:id` | `{ status?, category? }` (auth) |
| POST | `/api/emails/:id/reply` | `{ body }` → responde por Graph (auth) |
| POST | `/api/graph/notifications` | webhook de Graph (valida `clientState`) |
| GET | `/api/cron/sync?key=` | sincroniza el buzón |
| GET | `/api/cron/renew?key=` | crea/renueva la suscripción del webhook |
| GET | `/api/cron/summary?key=` | regenera el resumen semanal |
| GET | `/api/cron/classify?key=&n=` | clasifica correos pendientes |

## Puesta en marcha local

Desde la **raíz del repo** (no hay `package.json` en `server/`):

```bash
# crea server/.env con MySQL + credenciales de Graph + Gemini (ver .env.example)
npm install
npm run migrate           # crea las tablas
npm run seed              # datos de ejemplo (opcional, para probar sin Graph)
npm start                 # sirve frontend + API en http://localhost:8787
```

## Despliegue en Hostinger

El backend y el frontend se despliegan juntos con el preset **Express** del
deploy de GitHub. Guía completa: [`../docs/despliegue-hostinger.md`](../docs/despliegue-hostinger.md).

Resumen: build `npm run build`, inicio `npm start`, variables de entorno en el
panel del deploy, y una llamada a `/api/cron/setup?key=...` para crear tablas +
traer el buzón + activar el webhook.

## Registro de app en Entra ID (Microsoft)

`entra.microsoft.com` → *Aplicaciones → Registros de aplicaciones → Nuevo*:

- Permisos de **aplicación** de Microsoft Graph: `Mail.Read`, `Mail.ReadWrite`,
  `Mail.Send` → *Conceder consentimiento de administrador*.
- *Certificados y secretos* → nuevo secreto → cópialo en `MS_CLIENT_SECRET`.
- Limita el acceso a un solo buzón (Exchange Online PowerShell):
  ```powershell
  New-ApplicationAccessPolicy -AppId <MS_CLIENT_ID> `
    -PolicyScopeGroupId <grupo-con-el-buzon> -AccessRight RestrictAccess `
    -Description "Panel Buzon Soluctia"
  ```

## IA (clasificación, resumen y borradores)

Sin `AI_PROVIDER` (o `none`) el backend usa solo reglas: clasifica por palabras
clave y no genera borradores. Para el enriquecimiento completo elige un
proveedor en `.env`:

| `AI_PROVIDER` | Clave | Dónde se obtiene | Costo |
|---|---|---|---|
| `anthropic` | `ANTHROPIC_API_KEY` | console.anthropic.com → *API keys* | De pago, ~centavos/mes para un buzón |
| `gemini` | `GEMINI_API_KEY` | aistudio.google.com → *Get API key* | Capa gratuita (suficiente para un buzón) |
| `openai` | `OPENAI_API_KEY` | platform.openai.com | De pago |
| `azure` | `AZURE_OPENAI_*` | Portal de Azure | De pago (requiere suscripción Azure) |

> La licencia de **Microsoft 365 Copilot no sirve** aquí: es una experiencia de
> usuario dentro de Office, no una API. El equivalente Microsoft con API es
> **Azure OpenAI**, que es una suscripción de Azure aparte.
>
> Una suscripción de **Claude.ai / Claude Code tampoco es API**: la API de
> Anthropic se factura por separado en console.anthropic.com (muy económica).

Tras cambiar el proveedor, reclasifica lo ya guardado:
`curl "https://<api>/api/cron/classify?key=<CRON_SECRET>&n=200"` o borra
`enriched_at` de las filas y corre `node jobs/sync.js`.

## Notas del hosting compartido

- No hay WebSockets fiables: el panel refresca por *polling* cada 30 s.
- Passenger puede dormir la app; el cron `sync` cada 5 min es la red de
  seguridad si el webhook llega con la app fría.
- La suscripción de Graph para correo dura ~3 días → el cron `renew` la
  mantiene viva.
