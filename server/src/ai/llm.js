import { config } from '../config.js'

// Capa única de LLM. Cambia de proveedor solo con AI_PROVIDER en el .env.
//   none      -> sin IA (solo reglas)
//   anthropic -> API de Claude (console.anthropic.com)   [de pago, muy barato]
//   gemini    -> Google Gemini (aistudio.google.com)     [capa gratuita]
//   openai    -> OpenAI (platform.openai.com)            [de pago]
//   azure     -> Azure OpenAI                            [de pago, vía Azure]

const P = config.ai.provider
export const aiEnabled = P !== 'none'

function stripFences(s) {
  return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function post(url, headers, body, attempt = 0) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    // 429 / 5xx suelen ser transitorios: reintenta con espera creciente.
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(1500 * (attempt + 1))
      return post(url, headers, body, attempt + 1)
    }
    throw new Error(`IA ${res.status}: ${text.slice(0, 300)}`)
  }
  return JSON.parse(text)
}

async function openaiLike({ system, user, json, temperature }) {
  const isAzure = P === 'azure'
  const url = isAzure
    ? `${config.ai.azureEndpoint}/openai/deployments/${config.ai.azureDeployment}/chat/completions?api-version=2024-08-01-preview`
    : 'https://api.openai.com/v1/chat/completions'
  const headers = isAzure
    ? { 'api-key': config.ai.azureKey }
    : { Authorization: `Bearer ${config.ai.openaiKey}` }
  const data = await post(url, headers, {
    ...(isAzure ? {} : { model: config.ai.openaiModel }),
    temperature,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return data.choices[0].message.content
}

async function anthropic({ system, user, json, temperature }) {
  const data = await post(
    'https://api.anthropic.com/v1/messages',
    { 'x-api-key': config.ai.anthropicKey, 'anthropic-version': '2023-06-01' },
    {
      model: config.ai.anthropicModel,
      max_tokens: 1024,
      temperature,
      system: json ? `${system}\n\nResponde únicamente con el JSON, sin texto adicional.` : system,
      messages: [{ role: 'user', content: user }],
    },
  )
  return data.content.map((c) => c.text || '').join('')
}

async function gemini({ system, user, json, temperature }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.geminiModel}:generateContent?key=${config.ai.geminiKey}`
  const data = await post(url, {}, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      responseMimeType: json ? 'application/json' : 'text/plain',
    },
  })
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? ''
}

// Devuelve texto. Con json:true el prompt debe pedir JSON; el llamador parsea.
export async function chat({ system, user, json = false, temperature = 0.2 }) {
  if (!aiEnabled) throw new Error('IA deshabilitada (AI_PROVIDER=none)')
  let out
  if (P === 'anthropic') out = await anthropic({ system, user, json, temperature })
  else if (P === 'gemini') out = await gemini({ system, user, json, temperature })
  else if (P === 'openai' || P === 'azure') out = await openaiLike({ system, user, json, temperature })
  else throw new Error(`AI_PROVIDER desconocido: ${P}`)
  return json ? stripFences(out) : out.trim()
}
