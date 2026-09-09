# PROMPT — Crear buzón contacto@soluctiasas.com en Microsoft 365

## Contexto
Tengo una cuenta de Microsoft 365 con acceso de administrador. Mi dominio soluctiasas.com ya está configurado y funcional en Microsoft 365 (ya tengo otros correos funcionando con ese dominio). Necesito crear un nuevo buzón de correo: contacto@soluctiasas.com

## Lo que necesito que me guíes paso a paso

### Paso 1: Crear el usuario en admin.microsoft.com
- Estoy en admin.microsoft.com
- Necesito ir a Usuarios → Usuarios activos → Agregar un usuario
- Datos del nuevo usuario:
  - Nombre: Contacto
  - Apellido: Soluctia
  - Nombre para mostrar: Contacto Soluctia SAS
  - Nombre de usuario: contacto@soluctiasas.com
- Asignarle una licencia de Microsoft 365 que incluya Exchange Online (buzón de correo)
- Generar o definir una contraseña segura

### Paso 2: Verificar que el buzón funciona
- Entrar a outlook.office.com con las credenciales de contacto@soluctiasas.com
- Enviar un correo de prueba a mi correo personal
- Responder desde mi correo personal para confirmar que recibe

### Paso 3: Configuración básica del buzón
- Configurar la firma del correo con:
  - Nombre: Contacto — Soluctia SAS
  - Correo: contacto@soluctiasas.com
  - Sitio web: presentacion.soluctiasas.com
- Activar respuesta automática de confirmación (opcional):
  - Mensaje: "Hemos recibido tu mensaje. Te responderemos en un plazo máximo de 24 horas. — Equipo Soluctia SAS"

### Paso 4: Preparar el buzón para la demo de la presentación
- Enviar 5-6 correos de prueba desde diferentes cuentas (personales, de amigos) a contacto@soluctiasas.com simulando:
  1. Un cliente nuevo pidiendo información
  2. Una solicitud de cotización
  3. Un reclamo de servicio
  4. Un proveedor enviando una factura
  5. Un correo informativo / newsletter
  6. Un seguimiento de un cliente existente
- Esto genera datos reales en el buzón para la demo en vivo

## Notas
- El dominio soluctiasas.com ya tiene los registros MX configurados para Microsoft 365, por lo que no debería necesitar cambios en DNS.
- Si la licencia disponible no incluye Exchange Online, necesitaré saber qué licencias tengo asignables para elegir la correcta.
- Este buzón será el que se conecte al dashboard de presentacion.soluctiasas.com durante la presentación en la Universidad de los Llanos.
