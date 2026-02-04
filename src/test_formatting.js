const { procesarMensaje } = require('./handlers');

// Mock socket
const mockSock = {
  sendMessage: async (jid, content) => {
    console.log(`[MockSock] Sending to ${jid}:\n${content.text}`);
  }
};

// Mock message helper
const createMsg = (jid, text) => ({
  key: { remoteJid: jid },
  message: { conversation: text }
});

// Mock global fetch
global.fetch = async (url) => {
  console.log(`[MockFetch] Request to ${url}`);
  return {
    ok: true,
    json: async () => [
      {
        "tdespacho": "ALEGRIA V",
        "cliente": "860000531-01",
        "vendedor": "10266",
        "pedido": "44199",
        "total": 214846596.0000
      },
      {
        "tdespacho": "GRATITUD 2",
        "cliente": "860000531-01",
        "vendedor": "10184",
        "pedido": "46156",
        "total": null
      }
    ]
  };
};

async function runTests() {
  const jid = "12345@s.whatsapp.net";

  console.log("--- Test: Send Document Number (12345) ---");
  // Set state manually or simulate flow? 
  // Since procesarMensaje relies on internal state, we need to set it first.
  // Or just simulate the flow:
  
  // 1. Send "1" to enter WAITING_FOR_DOCUMENT state
  await procesarMensaje(mockSock, createMsg(jid, "1"));
  
  // 2. Send document number
  await procesarMensaje(mockSock, createMsg(jid, "12345"));
}

runTests();
