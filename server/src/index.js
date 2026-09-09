import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { api } from './routes/index.js'

const app = express()
app.set('trust proxy', 1)

app.use(
  cors({
    origin: config.appOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/api', api)

app.get('/', (req, res) => res.json({ service: 'presentacion-server', ok: true }))

// Manejo de errores centralizado
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Error interno' })
})

app.listen(config.port, () => {
  console.log(`API escuchando en :${config.port}`)
})
