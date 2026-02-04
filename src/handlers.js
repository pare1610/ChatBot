// Objeto para almacenar el estado de la conversación de cada usuario
// Las claves son los IDs de WhatsApp (remoteJid) y los valores son los estados actuales (e.g., 'SELECTING_ADVISOR')
const userState = {};

// Función auxiliar para extraer el texto de diferentes tipos de mensajes de WhatsApp
// WhatsApp puede enviar mensajes como texto simple, texto extendido, respuestas a botones, etc.
function getTextFromMessage(msg) {
  if (!msg.message) return "";

  return (
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.ephemeralMessage?.message?.extendedTextMessage?.text ||
    msg.message.ephemeralMessage?.message?.conversation ||
    msg.message.viewOnceMessage?.message?.listResponseMessage?.title ||
    msg.message.viewOnceMessage?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message.viewOnceMessageV2?.message?.listResponseMessage?.title ||
    msg.message.viewOnceMessageV2?.message?.buttonsResponseMessage?.selectedButtonId ||
    ""
  );
}

// Función principal para procesar los mensajes entrantes
async function procesarMensaje(sock, msg) {
  const remoteJid = msg.key.remoteJid; // ID único del usuario (número de teléfono + @s.whatsapp.net)
  const text = getTextFromMessage(msg); // Obtenemos el texto limpio del mensaje

  if (!text) return; // Si no hay texto, no hacemos nada

  const mensaje = text.trim().toLowerCase(); // Normalizamos el mensaje (minúsculas y sin espacios extra)
  console.log(`📩 Mensaje de ${remoteJid}: ${mensaje}`);

  let respuesta = "";

  // Reiniciar estado si el usuario dice palabras clave como "menu", "hola", etc.
  if (["menu", "menú", "hola", "buenas"].includes(mensaje)) {
    userState[remoteJid] = null;
  }

  // Obtenemos el estado actual del usuario
  const currentState = userState[remoteJid];

  // --- LÓGICA BASADA EN ESTADOS ---

  // Estado: Seleccionando un asesor
  if (currentState === "SELECTING_ADVISOR") {
    switch (mensaje) {
      case "1":
        respuesta =
          "👨‍💼 *Asesor de Ventas:*\nHabla con Pedro Arévalo aquí: https://wa.me/573174625040";
        userState[remoteJid] = null; // Reiniciamos el estado después de responder
        break;
      case "2":
        respuesta =
          "🛠️ *Soporte Técnico:*\nHabla con Luis Santana aquí: https://wa.me/573162219175";
        userState[remoteJid] = null;
        break;
      case "3":
        respuesta =
          "📄 *Facturación:*\nHabla con Freddy Acosta aquí: https://wa.me/573104853244";
        userState[remoteJid] = null;
        break;
      default:
        respuesta =
          "😅 Opción no válida.\nElige una opción del 1 al 3 o escribe *menu* para volver.";
        break;
    }
  }
  // Estado: Esperando número de documento para consulta de pedidos
  else if (currentState === "WAITING_FOR_DOCUMENT") {
    if (mensaje === "menu" || mensaje === "menú") {
      userState[remoteJid] = null;
      respuesta = "Operación cancelada. Escribe *menu* para ver las opciones.";
    } else {
      const documento = mensaje;
      try {
        // Consulta a la API local de pedidos
        const response = await fetch(
          `http://localhost:8080/sqlfactory/api/pedidos/cliente/${documento}`
        );
        if (response.ok) {
          const data = await response.json();
          // Si encontramos datos y es un array con elementos
          if (Array.isArray(data) && data.length > 0) {
            respuesta = "📄 *Resultado de la búsqueda:*\n\n";
            data.forEach((pedido) => {
              respuesta += `📦 *Pedido:* ${pedido.pedido}\n`;
              respuesta += `📍 *Despacho:* ${pedido.tdespacho}\n`;
              respuesta += `👤 *Cliente:* ${pedido.cliente}\n`;
              respuesta += `👨‍💼 *Vendedor:* ${pedido.vendedor}\n`;
              // Formateo de moneda para el total
              respuesta += `💰 *Total:* ${pedido.total
                ? new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                }).format(pedido.total)
                : "N/A"
                }\n`;
              respuesta += "-----------------------------------\n";
            });
          } else {
            respuesta = "⚠️ No se encontraron pedidos para este documento.";
          }
        } else {
          respuesta = `❌ Error al consultar pedidos. Código: ${response.status}`;
        }
      } catch (error) {
        console.error("Error fetching pedidos:", error);
        respuesta = "❌ Ocurrió un error al intentar consultar los pedidos. Intenta más tarde.";
      }
      userState[remoteJid] = null; // Reiniciamos el estado después de la consulta
    }
  }
  // Estado: Seleccionando tipo de cliente para cotización
  else if (currentState === "SELECTING_CLIENT_TYPE") {
    switch (mensaje) {
      case "1":
        respuesta = "👋 ¡Hola, cliente! Proporciona tu nit para continuar con la cotización."; // PENDIENTE: Lógica para cliente
        userState[remoteJid] = null;
        break;
      case "2":
        respuesta = "👋 ¡Bienvenido! Por favor, envíanos tus datos de contacto para ayudarte con tu cotización."; // PENDIENTE: Lógica para no cliente
        userState[remoteJid] = null;
        break;
      default:
        respuesta = "😅 Opción no válida.\nElige 1 (Soy Cliente) o 2 (No soy Cliente), o escribe *menu* para volver.";
        break;
    }
  }
  // --- MENÚ PRINCIPAL (Sin estado activo) ---
  else {
    // Si el usuario saluda o pide el menú
    if (["hola", "buenas", "menu", "menú"].includes(mensaje)) {
      respuesta =
        "¡Hola! Soy tu Charlie bot 🤖\n\n" +
        "Elige una opción:\n" +
        "1. Ver pedidos\n" +
        "2. Cotizar\n" +
        "3. Hablar con un asesor\n" +
        "4. Ver horarios de atención\n" +
        "5. Información de contacto";
    } else {
      // Manejo de las opciones del menú principal
      switch (mensaje) {
        case "1":
          userState[remoteJid] = "WAITING_FOR_DOCUMENT"; // Cambiamos estado a espera de documento
          respuesta = "🔢 Por favor, ingresa el número de documento para consultar tus pedidos:";
          break;
        case "2":
          userState[remoteJid] = "SELECTING_CLIENT_TYPE"; // Cambiamos estado a selección de tipo cliente
          respuesta = "📋 *Cotizar:*\nPor favor elige una opción:\n1. Soy Cliente\n2. No soy Cliente";
          break;
        case "3":
          userState[remoteJid] = "SELECTING_ADVISOR"; // Cambiamos estado a selección de asesor
          respuesta =
            "👨‍💻 *Elige un asesor:*\n" +
            "1. Ventas\n" +
            "2. Soporte Técnico\n" +
            "3. Facturación";
          break;
        case "4":
          respuesta =
            "🕒 Horarios:\nLunes a Viernes 08:00–17:00\nSábados 09:00–12:00";
          break;
        case "5":
          respuesta =
            "📲 Contáctanos en: info@proelectricos.com";
          break;
        default:
          respuesta =
            "😅 No entendí tu opción.\nEscribe *menu* para ver las opciones.";
          break;
      }
    }
  }

  // Si hay una respuesta generada, la enviamos al usuario
  if (respuesta) {
    await sock.sendMessage(remoteJid, { text: respuesta });
  }
}

module.exports = { procesarMensaje };
