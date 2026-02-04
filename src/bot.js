const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { procesarMensaje } = require('./handlers');
// Recuperar QR al principio
const qrcode = require('qrcode-terminal');


// Función principal asíncrona para configurar y conectar el bot
async function startBot() {
  // Configuración de la autenticación: guarda las credenciales en la carpeta "auth_info"
  // Esto permite que no tengas que escanear el QR cada vez que reinicias el bot.
  console.log('🔄 Iniciando bot... Buscando sesión existente...');
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  // Creamos el socket de conexión con WhatsApp usando las credenciales cargadas
  const sock = makeWASocket({
    auth: state,
  });

  // Evento que escucha actualizaciones de credenciales y las guarda automáticamente
  // Es vital para mantener la sesión activa.
  sock.ev.on("creds.update", saveCreds);

  // Evento que maneja las actualizaciones de la conexión (conectado, desconectado, QR recibido)
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 🔹 Si recibimos un código QR, lo mostramos en la terminal para ser escaneado
    if (qr) {
      console.log('📲 Escanea este QR con WhatsApp (Dispositivos vinculados):');
      qrcode.generate(qr, { small: true });
    }

    // Si la conexión se cierra, evaluamos si debemos reconectar
    if (connection === 'close') {
      // Verificamos si el error NO es un cierre de sesión manual (Logged Out)
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Conexión cerrada. ¿Reconectar?', shouldReconnect);

      // Si es un error recuperable, intentamos reiniciar el bot
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('Sesión cerrada. Vuelve a escanear el QR.');
      }
    } else if (connection === 'open') {
      // Conexión exitosa, el bot está listo
      console.log('✅ Bot conectado a WhatsApp');
    }
  });

  // Evento que escucha mensajes nuevos (upsert)
  sock.ev.on("messages.upsert", async (msgUpdate) => {
    // Solo procesamos las notificaciones de mensajes nuevos ('notify')
    if (msgUpdate.type !== 'notify') return;

    // Obtenemos el primer mensaje del array (usualmente viene uno solo)
    const msg = msgUpdate.messages[0];

    // Ignoramos mensajes vacíos o mensajes enviados por el propio bot (fromMe)
    if (!msg?.message || msg.key.fromMe) return;

    // Llamamos a la función encargada de procesar y responder el mensaje
    await procesarMensaje(sock, msg);
  });
}

module.exports = { startBot };
