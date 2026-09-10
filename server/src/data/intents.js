// Intenciones de respuesta que vienen de fábrica. Se cargan en la migración.
// El usuario puede desactivarlas y crear las suyas desde el panel.

export const BUILTIN_INTENTS = [
  {
    intent_key: 'acuse',
    label: 'Acuse de recibo',
    description: 'Confirmar que se recibió el correo, sin comprometerse a nada concreto.',
    prompt_hint: 'Breve. Agradece el mensaje e indica que se revisará y responderá pronto.',
    sort_order: 10,
  },
  {
    intent_key: 'responder_info',
    label: 'Responder con información',
    description: 'Contestar la consulta con la información disponible en el correo.',
    prompt_hint: 'Responde solo con datos que aparezcan en el hilo. Si falta algo, dilo.',
    sort_order: 20,
  },
  {
    intent_key: 'pedir_info',
    label: 'Pedir más información',
    description: 'Solicitar los datos que faltan para poder avanzar.',
    prompt_hint: 'Enumera claramente qué datos se necesitan y por qué.',
    sort_order: 30,
  },
  {
    intent_key: 'ofrecer_cotizacion',
    label: 'Ofrecer cotización',
    description: 'Confirmar que se preparará y enviará una cotización.',
    prompt_hint: 'Indica un plazo aproximado de envío y pide los datos que falten para cotizar.',
    sort_order: 40,
  },
  {
    intent_key: 'aceptar',
    label: 'Aceptar / confirmar',
    description: 'Aceptar la propuesta, orden o solicitud del remitente.',
    prompt_hint: 'Confirma con claridad y menciona el siguiente paso.',
    sort_order: 50,
  },
  {
    intent_key: 'declinar',
    label: 'Declinar cortésmente',
    description: 'Rechazar de forma amable, dejando la puerta abierta a futuro.',
    prompt_hint: 'Agradece, explica brevemente el motivo sin entrar en detalles, ofrece retomar más adelante.',
    sort_order: 60,
  },
  {
    intent_key: 'agendar',
    label: 'Proponer reunión',
    description: 'Sugerir una llamada o reunión para avanzar.',
    prompt_hint: 'Propón 2 o 3 franjas horarias y pregunta cuál le sirve.',
    sort_order: 70,
  },
  {
    intent_key: 'derivar',
    label: 'Derivar / escalar',
    description: 'Indicar que el tema se trasladará al área o persona correspondiente.',
    prompt_hint: 'Indica que se derivó y da un plazo estimado de respuesta.',
    sort_order: 80,
  },
  {
    intent_key: 'disculpa',
    label: 'Disculpa por demora',
    description: 'Reconocer una demora o error y ofrecer una solución o plazo.',
    prompt_hint: 'Discúlpate de forma sincera y breve, y da un compromiso concreto.',
    sort_order: 90,
  },
]
