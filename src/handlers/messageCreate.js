import { client } from '../client.js';
import { handleScanMessage } from '../services/scanHandler.js';

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  await handleScanMessage(message).catch(async (err) => {
    console.error('Scan error:', err);
    try {
      await message.channel.send(`⚠️ Error: ${err.message}`);
    } catch {}
  });
});
