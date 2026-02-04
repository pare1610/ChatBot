const { procesarMensaje } = require('./handlers');

const mockSock = {
  sendMessage: async (jid, content) => {
    console.log(`[MOCK SEND] To ${jid}: ${content.text}`);
  }
};

const testCases = [
  {
    name: "Standard Text Message",
    msg: {
      key: { remoteJid: "123@s.whatsapp.net" },
      message: { conversation: "menu" }
    }
  },
  {
    name: "Extended Text Message",
    msg: {
      key: { remoteJid: "123@s.whatsapp.net" },
      message: { extendedTextMessage: { text: "menu" } }
    }
  },
  {
    name: "Ephemeral Message (Common in some chats)",
    msg: {
      key: { remoteJid: "123@s.whatsapp.net" },
      message: {
        ephemeralMessage: {
          message: {
            extendedTextMessage: { text: "menu" }
          }
        }
      }
    }
  }
];

async function runTests() {
  for (const test of testCases) {
    console.log(`\n--- Testing: ${test.name} ---`);
    try {
      await procesarMensaje(mockSock, test.msg);
    } catch (e) {
      console.error("Error:", e);
    }
  }
}

runTests();
