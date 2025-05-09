import { Client, GatewayIntentBits } from 'discord.js';
import { token } from './config.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Joined in as ${client.user.tag}`);
});

export function login() {
  if (!token) throw new Error('Bot token is missing in .env');
  client.login(token);
}
