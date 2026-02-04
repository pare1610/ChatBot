# Documentación del Proyecto Chat-Bot

Este documento ofrece una explicación clara y concisa de cada archivo en el código fuente, diseñada para que cualquier persona pueda entender la estructura y funcionamiento del bot.

## Requisitos y Librerías

Para que este proyecto funcione correctamente, es necesario tener instalado **Node.js**. Además, el proyecto depende de las siguientes librerías principales, las cuales se instalan automáticamente al ejecutar `npm install`:

- **`@whiskeysockets/baileys`**: Es la librería núcleo que permite la conexión con los servidores de WhatsApp. Emula el funcionamiento de WhatsApp Web para enviar y recibir mensajes.
- **`qrcode-terminal`**: Esta utilidad permite generar y mostrar el código QR directamente en la consola (terminal) para que puedas escanearlo con tu celular y vincular el bot.

## Archivos Principales (`src/`)

### 1. `index.js`
**Punto de entrada de la aplicación.**
- Es el archivo que se ejecuta para iniciar el bot.
- Importa la función `startBot` desde `bot.js`.
- Ejecuta el bot y maneja cualquier error inicial que pueda ocurrir, mostrándolo en la consola.

### 2. `bot.js`
**Configuración y conexión de WhatsApp.**
- Se encarga de conectar el bot con los servidores de WhatsApp utilizando la librería `@whiskeysockets/baileys`.
- **Funcionalidades clave:**
  - **Autenticación:** Guarda y recupera la sesión (credenciales) en la carpeta `auth_info`.
  - **Código QR:** Genera y muestra el código QR en la terminal para que puedas vincular tu dispositivo.
  - **Reconexión:** Gestiona la reconexión automática si el internet falla o la conexión se cierra.
  - **Recepción de Mensajes:** Escucha los mensajes nuevos y los envía a `handlers.js` para ser procesados.

### 3. `handlers.js`
**Cerebro del bot (Lógica de respuestas).**
- Aquí se decide qué responder a cada mensaje del usuario.
- **Funciones principales:**
  - `getTextFromMessage(msg)`: Extrae el texto limpio de cualquier tipo de mensaje (texto simple, respuesta a botones, mensaje efímero, etc.).
  - `procesarMensaje(sock, msg)`: Es el núcleo de la lógica. Evalúa el estado del usuario (`userState`) y el contenido del mensaje.
- **Flujos manejados:**
  - **Menú Principal:** Muestra opciones (1. Pedidos, 2. Cotizar, etc.).
  - **Consulta de Pedidos (Opción 1):** Solicita un documento, consulta una API local (`localhost:8080`) y muestra los pedidos encontrados.
  - **Cotización (Opción 2):** Pregunta si es cliente o no (lógica pendiente de implementación completa).
  - **Asesores (Opción 3):** Devuelve enlaces directos a WhatsApp de asesores de ventas, soporte o facturación.
  - **Información General (Opciones 4 y 5):** Muestra horarios y contacto.

## Archivos de Prueba (`src/`)

Estos archivos se utilizan para verificar que el bot funcione correctamente sin necesidad de conectarlo a WhatsApp real cada vez.

### 4. `test_formatting.js`
**Prueba de formato de respuestas.**
- Simula una conversación donde el usuario consulta sus pedidos.
- Utiliza datos falsos ("mock") para simular la respuesta de la API de pedidos.
- Verifica que el bot formatee correctamente la lista de pedidos (mostrando pedido, despacho, cliente, vendedor y total en formato de moneda).

### 5. `test_handlers.js`
**Prueba de flujo básico.**
- Ejecuta una secuencia simple de pasos para asegurar que la navegación del menú funciona:
  1. Envía "menu" (debería mostrar el menú principal).
  2. Envía "1" (debería pedir el documento).
  3. Envía un número de documento (intenta consultar la API).

### 6. `test_repro.js`
**Prueba de tipos de mensajes.**
- Verifica que el bot pueda leer texto desde diferentes estructuras de mensajes de WhatsApp que pueden variar técnicamente:
  - Mensaje de texto estándar.
  - Mensaje de texto extendido.
  - Mensaje efímero (mensajes que desaparecen).
- Asegura que la función `getTextFromMessage` en `handlers.js` sea robusta.
