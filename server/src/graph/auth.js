import { ConfidentialClientApplication } from '@azure/msal-node'
import { config } from '../config.js'

// Autenticación app-only (client credentials) contra Microsoft Graph.
let msal = null
let cached = { token: null, expiresAt: 0 }

function client() {
  if (!msal) {
    msal = new ConfidentialClientApplication({
      auth: {
        clientId: config.graph.clientId,
        authority: `https://login.microsoftonline.com/${config.graph.tenantId}`,
        clientSecret: config.graph.clientSecret,
      },
    })
  }
  return msal
}

export async function getGraphToken() {
  const now = Date.now()
  if (cached.token && now < cached.expiresAt - 60_000) return cached.token

  const result = await client().acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  })
  if (!result?.accessToken) throw new Error('No se pudo obtener token de Graph')

  cached = {
    token: result.accessToken,
    expiresAt: result.expiresOn ? new Date(result.expiresOn).getTime() : now + 3_000_000,
  }
  return cached.token
}
