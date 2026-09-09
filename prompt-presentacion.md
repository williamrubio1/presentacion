# PROMPT — Sitio web: presentacion.soluctiasas.com

## Contexto
Soy un profesional que va a dar una presentación virtual en la Universidad de los Llanos (Unillanos) en Villavicencio, Colombia, sobre automatización de procesos y tareas repetitivas orientado al correo electrónico y la gestión empresarial. Necesito un sitio web funcional que sirva como demo en vivo durante la presentación.

## Stack técnico (ya instalado)
- React (Vite) + Tailwind CSS
- react-router-dom (rutas)
- recharts (gráficas)
- lucide-react (íconos)
- Dominio: presentacion.soluctiasas.com
- Hosting: Hostinger (sitio estático)

## Estructura del sitio

El sitio tiene DOS secciones principales con navegación entre ellas:

---

### SECCIÓN 1: Landing page (`/`)

Página profesional de presentación de la empresa **Soluctia SAS** con el siguiente contenido:

**Header:**
- Logo o nombre "SOLUCTIA SAS" con un estilo moderno y limpio
- Menú de navegación: Inicio, Servicios, Dashboard (enlace a /dashboard), Contacto
- Debe ser responsive (hamburger menu en móvil)

**Hero section:**
- Título principal: "Automatización inteligente para tu negocio"
- Subtítulo: "Transforma tareas repetitivas en procesos eficientes con tecnología accesible"
- Botón CTA: "Ver Dashboard en vivo" (enlaza a /dashboard)
- Fondo con gradiente profesional (tonos azul oscuro, azul corporativo)

**Sección "¿Qué hacemos?":**
- 3 cards con íconos de lucide-react:
  1. "Automatización de Correo" — Resúmenes automáticos, clasificación y alertas inteligentes
  2. "Dashboards en Tiempo Real" — Visualiza lo que pasa en tu empresa sin abrir el correo
  3. "Integración con IA" — Copilot, agentes inteligentes y respuestas automatizadas con aprobación humana

**Sección "El problema":**
- Un dato grande y visual: "Un profesional dedica el 28% de su jornada laboral a leer y responder correos — McKinsey"
- Contador visual animado: "120 correos/día × 5 días × 48 semanas = 28,800 correos al año"

**Sección "Automatización en Colombia":**
- 3 estadísticas destacadas con animación al hacer scroll:
  1. "1,400+" — Empresas colombianas adoptaron IA en 2025 (Fuente: Portafolio)
  2. "105 min" — Ahorro semanal promedio por empleado (Fuente: Davinci Technologies)
  3. "66%" — PYMES colombianas ya integran IA (Fuente: Sense Digital)

**Sección "Línea del tiempo":**
- Timeline visual horizontal o vertical con 3 momentos:
  - 2016: "Los inicios — IFTTT, Zapier. Automatizaciones simples: si recibo correo, guárdalo. Mercado incipiente."
  - 2021: "Hiperautomatización — Gartner proyecta $596B. RPA + IA. Territorio de grandes corporaciones."
  - 2026: "Agentes de IA — Mercado de $1.04 billones (Gartner). 90% de grandes empresas priorizan hiperautomatización. Cualquier persona puede automatizar."

**Sección "Herramientas":**
- Grid de logos/cards con 3 niveles:
  - Nivel 1 (Cualquier persona): Filtros de correo, IFTTT, Zapier
  - Nivel 2 (Usuario avanzado): Make, Google Apps Script, Power Automate
  - Nivel 3 (Técnico): n8n self-hosted, Supabase, APIs, webhooks

**Sección contacto:**
- Correo: contacto@soluctiasas.com
- Formulario simple: Nombre, Email, Mensaje
- El formulario NO necesita backend real, solo la interfaz visual

**Footer:**
- © 2026 Soluctia SAS
- Enlaces a redes sociales (íconos placeholder)
- "Presentación para la Universidad de los Llanos — Villavicencio, Meta"

---

### SECCIÓN 2: Dashboard (`/dashboard`)

Esta es la página estrella de la demo. Simula un centro de mando empresarial que muestra en tiempo real lo que pasa con el correo de la empresa. Toda la data es simulada con datos de ejemplo realistas.

**Header del dashboard:**
- Barra superior oscura con: "Soluctia SAS — Centro de Mando" a la izquierda
- Botón "Volver al inicio" (enlaza a /)
- Indicador verde parpadeante: "● En vivo" (simulado)
- Fecha y hora actual (actualizada en tiempo real con JS)

**Fila de métricas principales (4 cards):**
1. "Correos hoy" → 47 (ícono de mail)
2. "Sin responder" → 5 (ícono de alerta, color amarillo/rojo)
3. "Tiempo promedio de respuesta" → 2h 15min (ícono de reloj)
4. "Tasa de respuesta" → 89% (ícono de check)

**Gráfica de actividad (recharts):**
- Gráfica de líneas: "Correos recibidos vs respondidos — Últimos 7 días"
- Dos líneas: una para recibidos (azul), otra para respondidos (verde)
- Datos de ejemplo para lunes a domingo
- Tooltip interactivo al pasar el mouse

**Tabla de correos recientes:**
- Tabla con columnas: Hora, Remitente, Asunto, Categoría, Estado
- 8-10 filas de ejemplo con datos realistas de una empresa colombiana:
  - Categorías con badge de color: "Cliente nuevo" (verde), "Cotización" (azul), "Reclamo" (rojo), "Informativo" (gris), "Proveedor" (morado)
  - Estados: "Respondido" (verde), "Pendiente" (amarillo), "Urgente" (rojo parpadeante)
- Ejemplo de datos:
  - 9:15 AM | Carlos Méndez | Cotización servicio anual | Cotización | Pendiente
  - 9:02 AM | María López | Re: Propuesta comercial | Cliente nuevo | Respondido
  - 8:45 AM | Proveedor TechCo | Factura #4521 | Proveedor | Respondido
  - 8:30 AM | Andrea Ruiz | Queja servicio postventa | Reclamo | Urgente
  - etc.

**Panel lateral o sección inferior: "Timeline del cliente"**
- Al hacer clic en un remitente de la tabla, muestra un timeline vertical con todas las interacciones simuladas con ese cliente:
  - "15 ago 2026 — Primer contacto: Solicitud de información"
  - "18 ago 2026 — Enviamos cotización"
  - "22 ago 2026 — Cliente solicita ajuste de precios"
  - "25 ago 2026 — Cotización ajustada enviada"
  - "01 sep 2026 — Cliente confirma orden"
- Esto demuestra la trazabilidad que mencionamos en la presentación

**Sección "Alertas activas":**
- 3 alertas visuales tipo notificación:
  1. 🔴 "Andrea Ruiz — Reclamo sin responder hace 4 horas"
  2. 🟡 "Carlos Méndez — Cotización pendiente hace 2 días"
  3. 🟢 "Meta semanal cumplida: 89% tasa de respuesta"

**Sección "Resumen IA" (simulado):**
- Un card que simula un resumen generado por IA:
  - Título: "📊 Resumen semanal generado por IA"
  - Texto: "Esta semana se recibieron 234 correos. Se respondieron 208 (89%). 3 clientes no han recibido respuesta en más de 48 horas: Andrea Ruiz, Carlos Méndez y TechCo Proveedores. La categoría con más volumen fue Cotizaciones (34%). Se recomienda priorizar los reclamos pendientes antes del cierre del día."

---

## Requisitos de diseño

1. **Paleta de colores:** Profesional y moderna. Azul oscuro (#1a1a2e o similar) como color principal, acentos en azul corporativo (#4361ee), verde para positivos (#10b981), rojo para alertas (#ef4444), amarillo para pendientes (#f59e0b). Fondo claro para la landing (#f8fafc), fondo oscuro para el dashboard (#0f172a).

2. **Tipografía:** Usar la fuente del sistema (font-sans de Tailwind). Títulos en bold, cuerpo en regular.

3. **Animaciones:** Transiciones suaves en hover de botones y cards. Los números de las métricas del dashboard pueden tener animación de conteo al cargar. El indicador "En vivo" debe parpadear.

4. **Responsive:** Debe verse bien en desktop (para la presentación) y en móvil (por si alguien del público accede desde su celular).

5. **NO usar localStorage ni sessionStorage** — mantener todo en estado de React.

6. **Single Page Application:** Usar react-router-dom para la navegación entre / y /dashboard sin recarga de página.

7. **Todo en un solo proyecto:** No separar en múltiples repositorios. CSS con Tailwind (clases de utilidad), sin archivos CSS externos excepto el import de Tailwind en el main.

8. **Datos simulados:** Toda la data del dashboard es estática/simulada con datos de ejemplo en un archivo de datos (por ejemplo src/data/mockData.js). No necesita backend ni API real.

---

## Estructura de archivos sugerida

```
src/
├── App.jsx              (Router principal)
├── main.jsx             (Entry point)
├── index.css            (Import de Tailwind)
├── data/
│   └── mockData.js      (Datos simulados del dashboard)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── DashboardHeader.jsx
│   ├── landing/
│   │   ├── Hero.jsx
│   │   ├── Services.jsx
│   │   ├── Problem.jsx
│   │   ├── Stats.jsx
│   │   ├── Timeline.jsx
│   │   ├── Tools.jsx
│   │   └── Contact.jsx
│   └── dashboard/
│       ├── MetricCards.jsx
│       ├── ActivityChart.jsx
│       ├── EmailTable.jsx
│       ├── ClientTimeline.jsx
│       ├── Alerts.jsx
│       └── AISummary.jsx
└── pages/
    ├── Landing.jsx       (Compone todas las secciones de landing)
    └── Dashboard.jsx     (Compone todas las secciones de dashboard)
```

---

## Importante

- Este sitio se despliega en Hostinger como sitio estático. El build final (`npm run build`) genera la carpeta `dist/` que es lo que se sube.
- El dominio es presentacion.soluctiasas.com
- La presentación es para una audiencia universitaria en Colombia, así que todo el texto debe estar en español.
- El objetivo es impresionar: que se vea profesional, moderno y funcional. Esto es una demo en vivo, no un prototipo.
