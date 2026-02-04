// Importamos la función principal para iniciar el bot desde el archivo bot.js
const { startBot } = require('./bot');

// Ejecutamos la función de inicio del bot
// Si ocurre algún error durante el inicio, lo capturamos y lo mostramos en la consola
startBot().catch((err) => {
  console.error('Error al iniciar el bot:', err);
});
