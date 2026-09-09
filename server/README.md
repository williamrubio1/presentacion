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

```bash
cd server
cp .env.example .env      # completa los valores
npm install
npm run migrate           # crea las tablas
npm run seed              # datos de ejemplo (opcional, para probar sin Graph)
npm run dev               # http://localhost:8787
```

## Despliegue en Hostinger (hosting con Node.js)

1. **Base de datos** — hPanel → *Bases de datos → MySQL* → crear base y usuario.
   Anota host, nombre, usuario y contraseña.
2. **App Node.js** — hPanel → *Avanzado → Node.js*:
   - Versión de Node: 20 o superior.
   - Carpeta de la aplicación: sube el contenido de `server/` (sin `node_modules`).
   - Archivo de inicio: `src/index.js`.
   - Variables de entorno: copia las de `.env.example` con tus valores reales.
     Pon `APP_ORIGIN=https://presentacion.soluctiasas.com` y
     `COOKIE_DOMAIN=presentacion.soluctiasas.com`.
   - Asigna la app a un subdominio, p. ej. `api.presentacion.soluctiasas.com`.
3. En la consola de la app: `npm install` y luego `npm run migrate`.
4. **Cron jobs** — hPanel → *Avanzado → Cron Jobs* (ajusta la ruta a tu carpeta):
   ```
   */5 * * * *   cd ~/domains/api.presentacion.soluctiasas.com/app && node jobs/sync.js
   0 */2 * * *   cd ~/domains/api.presentacion.soluctiasas.com/app && node jobs/renew.js
   0 7 * * 1     cd ~/domains/api.presentacion.soluctiasas.com/app && node jobs/summary.js
   ```
   (o usa `curl` contra `/api/cron/*?key=$CRON_SECRET`).
5. **Frontend** — en el proyecto raíz, crea `.env` con
   `VITE_API_URL=https://api.presentacion.soluctiasas.com`, `npm run build`,
   sube `dist/` a `public_html`.
6. **Primera carga de datos**: `node jobs/renew.js` (crea el webhook) y
   `node jobs/sync.js` (trae el histórico y lo clasifica).

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

## Notas del hosting compartido

- No hay WebSockets fiables: el panel refresca por *polling* cada 30 s.
- Passenger puede dormir la app; el cron `sync` cada 5 min es la red de
  seguridad si el webhook llega con la app fría.
- La suscripción de Graph para correo dura ~3 días → el cron `renew` la
  mantiene viva.
