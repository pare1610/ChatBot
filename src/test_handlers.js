const { procesarMensaje } = require('./handlers');

// Mock socket
const mockSock = {
  sendMessage: async (jid, content) => {
    console.log(`[MockSock] Sending to ${jid}:`, content.text);
  }
};

// Mock message helper
const createMsg = (jid, text) => ({
  key: { remoteJid: jid },
  message: { conversation: text }
});

async function runTests() {
  const jid = "12345@s.whatsapp.net";

  console.log("--- Test 1: Menu ---");
  await procesarMensaje(mockSock, createMsg(jid, "menu"));

  console.log("\n--- Test 2: Select Option 1 (Ver pedidos) ---");
  await procesarMensaje(mockSock, createMsg(jid, "1"));

  console.log("\n--- Test 3: Send Document Number (12345) ---");
  // This will try to fetch from localhost:8080. It might fail if server is not up, but we want to see the attempt.
  await procesarMensaje(mockSock, createMsg(jid, "12345"));
}

runTests();
