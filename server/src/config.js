import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'

// Carga server/.env sin importar desde dónde se ejecute (npm start corre desde
// la raíz del repo). En Hostinger las variables van en el panel del deploy y
// dotenv no las pisa.
loadEnv({ path: fileURLToPath(new URL('../.env', import.meta.url)) })
loadEnv() // también .env de la carpeta actual, por si acaso

function required(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Falta la variable de entorno ${name}`)
  return v
}

export const config = {
  port: process.env.PORT || 8787,
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:5173',
  cookieDomain: process.env.COOKIE_DOMAIN || '',
  sessionSecret: process.env.SESSION_SECRET || 'cambia-esto-en-produccion',
  panelPassword: process.env.PANEL_PASSWORD || 'demo',
  cronSecret: process.env.CRON_SECRET || 'cron',

  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'presentacion',
  },

  graph: {
    tenantId: process.env.MS_TENANT_ID || '',
    clientId: process.env.MS_CLIENT_ID || '',
    clientSecret: process.env.MS_CLIENT_SECRET || '',
    mailbox: process.env.MAILBOX || '',
    webhookUrl: process.env.GRAPH_WEBHOOK_URL || '',
    webhookSecret: process.env.GRAPH_WEBHOOK_SECRET || 'soluctia-webhook',
  },

  ai: {
    // 'none' | 'anthropic' | 'gemini' | 'openai' | 'azure'
    provider: process.env.AI_PROVIDER || 'none',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
    geminiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
    // Pausa entre llamadas de clasificación (ms). Útil para respetar el
    // límite por minuto de la capa gratuita (Gemini Flash-Lite ~15/min).
    paceMs: Number(process.env.AI_PACE_MS || 0),
    openaiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    azureKey: process.env.AZURE_OPENAI_KEY || '',
    azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
  },

  // Metas para las alertas del panel
  responseRateTarget: Number(process.env.RESPONSE_RATE_TARGET || 85),
}

export function assertGraphConfigured() {
  required('MS_TENANT_ID')
  required('MS_CLIENT_ID')
  required('MS_CLIENT_SECRET')
  required('MAILBOX')
}
