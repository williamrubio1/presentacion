# Fase 4 — Despliegue en Hostinger

Todo bajo el mismo dominio (mismo origen → sin CORS):

```
presentacion.soluctiasas.com/         → public_html/  (dist del frontend)
presentacion.soluctiasas.com/api/...  → app Node.js (carpeta server/, vía Passenger)
```

---

## Paso 1 — Base de datos MySQL

Ya creada:
- BD: `u154452028_presentacion`
- Usuario: `u154452028_user`
- Host: `localhost`

---

## Paso 2 — Subir el backend por SSH

```bash
ssh -p 65002 u154452028@185.239.210.168
cd ~
git clone https://github.com/williamrubio1/presentacion.git
```

Queda en `~/presentacion`. Actualizaciones futuras: `cd ~/presentacion && git pull`
y **reiniciar** la app en hPanel.

---

## Paso 3 — Crear la app Node.js

hPanel → **Avanzado → Node.js → Crear aplicación**:

| Campo | Valor |
|---|---|
| Versión de Node.js | 22 |
| Modo | Production |
| Raíz de la aplicación | `presentacion/server` |
| URL de la aplicación | `presentacion.soluctiasas.com/api` |
| Archivo de inicio | `src/index.js` |

### Variables de entorno

En la misma pantalla, agrégalas de `server/.env.production.example`. Completa:
`MYSQL_PASSWORD`, `PANEL_PASSWORD`, `MS_CLIENT_SECRET`, `GEMINI_API_KEY`.

### Instalar y preparar

Botón **"Ejecutar NPM Install"**. Luego, por SSH, activa el entorno de la app
(hPanel muestra la línea `source ~/nodevenv/presentacion-server/22/bin/activate`
o similar) y:

```bash
cd ~/presentacion/server
npm run migrate      # crea las tablas
node jobs/sync.js    # trae y clasifica el histórico del buzón
node jobs/renew.js   # crea la suscripción del webhook (tiempo real)
```

### Verificar

`https://presentacion.soluctiasas.com/api/health` → `{"ok":true,...}`

Si da 404: el enrutado de `/api` a Passenger no quedó activo (ver "Problemas"
abajo).

---

## Paso 4 — Frontend

En tu equipo, raíz del repo:

```bash
echo "VITE_API_URL=https://presentacion.soluctiasas.com" > .env
npm run build
```

Sube **el contenido de `dist/`** a `public_html/` (incluye `dist/.htaccess`,
que ya excluye `/api` del fallback SPA). Reemplaza lo que haya.

---

## Paso 5 — Cron jobs

hPanel → **Avanzado → Trabajos Cron** (`key` = `CRON_SECRET`):

| Frecuencia | Comando |
|---|---|
| `*/5 * * * *` | `curl -s "https://presentacion.soluctiasas.com/api/cron/sync?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"` |
| `0 */2 * * *` | `curl -s "https://presentacion.soluctiasas.com/api/cron/renew?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"` |
| `30 6 * * 1` | `curl -s "https://presentacion.soluctiasas.com/api/cron/summary?key=Yi2Whft7Fa0yfZn_f9ws-Zo3q_tkk_Ni"` |

---

## Paso 6 — Verificar

1. `https://presentacion.soluctiasas.com/dashboard` → pide contraseña (`PANEL_PASSWORD`).
2. Entra → banner **"Conectado al buzón — datos reales"**.
3. Envía un correo a `contacto@soluctiasas.com` → aparece en <1 min.

---

## Problemas frecuentes

- **`/api/health` da 404 o el HTML del frontend**: Passenger no está capturando
  `/api`. En la app Node.js de hPanel, confirma que la URL es
  `presentacion.soluctiasas.com/api` (con el path). Si Hostinger no permite
  montar la app en un subpath del sitio, usa un **subdominio**
  `api.presentacion.soluctiasas.com`: cambia `GRAPH_WEBHOOK_URL` y
  `VITE_API_URL` a ese host y reconstruye el frontend (el backend ya soporta
  CORS entre subdominios).
- **`/api/cron/renew` falla**: el webhook necesita HTTPS válido y que la ruta
  pública coincida exacta con `GRAPH_WEBHOOK_URL`.
- **Passenger duerme la app**: la despierta la siguiente petición (1-3 s). El
  cron `sync` cada 5 min cubre los correos que lleguen con la app fría.
- **Suscripción de Graph**: dura ~3 días; el cron `renew` la mantiene.
- **Seguridad**: rota `MS_CLIENT_SECRET` (el de pruebas quedó en el chat) y
  aplica la *Application Access Policy* en Exchange (comando en `server/README.md`).
