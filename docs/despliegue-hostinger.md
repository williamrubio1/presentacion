# Fase 4 — Despliegue en Hostinger

Frontend estático + backend Node + MySQL, todo en el mismo hosting.

```
presentacion.soluctiasas.com        → public_html/  (dist del frontend)
api.presentacion.soluctiasas.com    → app Node.js (carpeta server/)
```

---

## Paso 0 — Confirmar que el plan tiene Node.js

hPanel → **Sitios web → (tu sitio) → Panel → Avanzado**. Debe aparecer
**"Node.js"**. Si no aparece, el plan no lo soporta (Premium no; Business y
Cloud sí) — avísame y vemos un backend externo gratuito.

---

## Paso 1 — Base de datos MySQL

hPanel → **Bases de datos → MySQL → Crear base de datos nueva**:

- Nombre de BD: `panel`  → queda como `u154452028_panel`
- Usuario: `panel` → queda como `u154452028_panel`
- Contraseña: genera una y **guárdala**

Anota los 4 valores para el `.env` (`MYSQL_HOST=localhost`).

---

## Paso 2 — Subdominio para la API

hPanel → **Dominios → Subdominios → Crear**:

- Subdominio: `api.presentacion`  (dominio `soluctiasas.com`)
  → resultado: `api.presentacion.soluctiasas.com`
- Deja que cree la carpeta que sugiera (p. ej. `domains/api.presentacion.soluctiasas.com/public_html`).

Espera unos minutos a que emita el **SSL** (candado) para ese subdominio.

---

## Paso 3 — App Node.js

hPanel → **Avanzado → Node.js → Crear aplicación**:

| Campo | Valor |
|---|---|
| Versión de Node | 20 (o superior) |
| Raíz de la aplicación | la carpeta del subdominio del Paso 2 |
| URL de la aplicación | `api.presentacion.soluctiasas.com` |
| Archivo de inicio | `src/index.js` |

### Subir el código

Sube **el contenido de la carpeta `server/`** del repo a la raíz de la
aplicación (por **Administrador de archivos**, FTP, o `git clone` por SSH).
**No subas `node_modules` ni `.env`.**

Estructura que debe quedar en la raíz de la app:
```
src/  jobs/  package.json  package-lock.json
```

### Variables de entorno

En la misma pantalla de la app Node.js, sección **Variables de entorno**,
agrega una por una las de `server/.env.production.example` con tus valores
reales. Claves que debes completar tú:

- `MYSQL_PASSWORD`, `MYSQL_USER`, `MYSQL_DATABASE` (Paso 1)
- `PANEL_PASSWORD` (la que usarás para entrar al panel)
- `MS_CLIENT_SECRET` — **crea uno nuevo** en Entra ID (no reuses el de pruebas):
  *Certificados y secretos → Nuevo secreto de cliente*
- `GEMINI_API_KEY` (la que ya tienes)

### Instalar y migrar

En la pantalla de la app: botón **"Ejecutar NPM Install"**.
Luego, en **Terminal / SSH** dentro de la carpeta de la app:

```bash
npm run migrate      # crea las tablas
node jobs/sync.js    # trae y clasifica el histórico del buzón
node jobs/renew.js   # crea la suscripción del webhook (tiempo real)
```

Prueba: abre `https://api.presentacion.soluctiasas.com/api/health` → debe
responder `{"ok":true,...}`.

---

## Paso 4 — Cron jobs

hPanel → **Avanzado → Trabajos Cron**. Usa la forma con `curl` (no depende de
rutas):

| Frecuencia | Comando |
|---|---|
| Cada 5 min | `curl -s "https://api.presentacion.soluctiasas.com/api/cron/sync?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"` |
| Cada 2 h | `curl -s "https://api.presentacion.soluctiasas.com/api/cron/renew?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"` |
| Lunes 6:30 | `curl -s "https://api.presentacion.soluctiasas.com/api/cron/summary?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"` |

(La `key` es el `CRON_SECRET`. Si lo cambiaste, ajústala.)

---

## Paso 5 — Frontend

En tu equipo, en la raíz del repo:

```bash
echo "VITE_API_URL=https://api.presentacion.soluctiasas.com" > .env
npm run build
```

Sube **el contenido de `dist/`** (incluido `dist/.htaccess`) a `public_html/`
del dominio principal, reemplazando lo que haya.

---

## Paso 6 — Verificar

1. `https://presentacion.soluctiasas.com/dashboard` → debe pedir contraseña
   (`PANEL_PASSWORD`).
2. Al entrar: banner **"Conectado al buzón — datos reales"** y los correos
   reales.
3. Manda un correo de prueba a `contacto@soluctiasas.com` → en <1 min aparece
   en el panel (webhook + cron).

---

## Notas

- **Passenger duerme la app** tras inactividad; la despierta la siguiente
  petición (arranque en frío 1-3 s). El cron `sync` cada 5 min es la red de
  seguridad si el webhook llega con la app fría.
- La **suscripción de Graph** para correo dura ~3 días → el cron `renew` la
  mantiene viva.
- Si `/api/cron/renew` falla con error de URL: el SSL del subdominio aún no
  está listo, o `GRAPH_WEBHOOK_URL` no coincide exactamente con la ruta real.
- El `MS_CLIENT_SECRET` de pruebas quedó expuesto en el chat: bórralo en Entra
  ID cuando el de producción esté funcionando.
- Falta (recomendado, no bloquea): **Application Access Policy** en Exchange
  para limitar `Mail.Read` a un solo buzón. Comando en `server/README.md`.
