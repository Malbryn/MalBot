export {};

import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';
import { Logger } from 'tslog';
import { config } from './config/config';
import { ExtendedClient } from './models/ExtendedClient';
import handleClientReady from './listeners/client-ready';
import handleInteractionCreate from './listeners/interaction-create';

const logger = new Logger(config.LOGGER_SETTINGS);

logger.info('Starting bot...');

// Initialise client
const client: ExtendedClient = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

handleClientReady(client);
handleInteractionCreate(client);

// Initialise player
client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    },
});

// Log in with token
client.login(config.DISCORD_TOKEN);
