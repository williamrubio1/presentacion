import { one } from '../db.js'
import { chat, aiEnabled } from '../ai/llm.js'

// Genera un borrador de respuesta para una intención concreta.
export async function generateDraft(emailId, { intentId, instruccion } = {}) {
  const email = await one('SELECT * FROM emails WHERE id = ?', [emailId])
  if (!email) throw new Error('Correo no encontrado')

  const intent = intentId
    ? await one('SELECT * FROM intents WHERE id = ? AND active = 1', [intentId])
    : null
  if (intentId && !intent) throw new Error('Intención no válida')

  if (!aiEnabled) {
    throw new Error('La IA está deshabilitada (AI_PROVIDER=none)')
  }

  const system = `Redacta la respuesta a un correo, en español, profesional y cordial, en nombre del equipo de Soluctia SAS.
Devuelve SOLO el cuerpo del mensaje (sin asunto, sin "De:"/"Para:"). Termina con una despedida y "Equipo Soluctia SAS".
No inventes datos, precios ni compromisos que no estén en el correo original o en las instrucciones.
${intent ? `Intención de la respuesta: ${intent.label} — ${intent.description}${intent.prompt_hint ? `\nPauta: ${intent.prompt_hint}` : ''}` : 'Intención: responder de forma adecuada al contenido.'}
${instruccion?.trim() ? `\nInstrucción adicional del usuario (tiene prioridad): ${instruccion.trim()}` : ''}`

  const user = `Correo recibido de ${email.from_name || email.from_email}:
Asunto: ${email.subject || '(sin asunto)'}

${(email.body_text || email.preview || '').slice(0, 4000)}`

  const draft = await chat({ system, user, temperature: 0.4 })
  return { draft: draft.slice(0, 4000), intent: intent?.label ?? null }
}
