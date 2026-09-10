import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { api } from './routes/index.js'

const app = express()
app.set('trust proxy', 1)

// Si Passenger (Hostinger) monta la app en un subpath (p. ej. /api) y recorta
// esa base de la ruta, la reponemos para que las rutas de Express coincidan.
const baseUri = process.env.PASSENGER_BASE_URI
if (baseUri && baseUri !== '/') {
  app.use((req, _res, next) => {
    if (!req.url.startsWith(baseUri)) req.url = baseUri + req.url
    next()
  })
}

app.use(
  cors({
    origin: config.appOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/api', api)

// Sirve el frontend compilado (dist/) desde el mismo origen que la API.
const distDir = path.resolve(fileURLToPath(new URL('../../dist', import.meta.url)))
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
  console.log('Sirviendo frontend desde', distDir)
} else {
  app.get('/', (req, res) => res.json({ service: 'presentacion-server', ok: true }))
  console.warn('dist/ no encontrado — solo API. Ejecuta "npm run build".')
}

// Manejo de errores centralizado
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Error interno' })
})

app.listen(config.port, () => {
  console.log(`Servidor en :${config.port}`)
})
