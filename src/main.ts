export {};

import { Client, GatewayIntentBits } from 'discord.js';
import { Logger } from 'tslog';
import { config } from './config/config';
import handleInteractionCreate from './listeners/interaction-create';
import handleClientReady from './listeners/client-ready';

const logger = new Logger(config.LOGGER_SETTINGS);

logger.info('Starting bot...');

// Initialise client
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

handleClientReady(client);
handleInteractionCreate(client);

// Log in with token
client.login(config.DISCORD_TOKEN);
