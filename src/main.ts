export {};

import { Player } from 'discord-player';
import { Client, GatewayIntentBits } from 'discord.js';
import { Logger } from 'tslog';
import { Filter, downloadOptions } from 'ytdl-core';
import { config } from './config/config';
import handleClientReady from './listeners/client-ready';
import handleInteractionCreate from './listeners/interaction-create';

const logger = new Logger(config.LOGGER_SETTINGS);

logger.info('Starting bot...');

// Initialise client
const client: Client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

handleClientReady(client);
handleInteractionCreate(client);

// Initialise music player
const ytdlOptions: Partial<downloadOptions> = {
    quality: config.MUSIC_QUALITY,
    filter: config.MUSIC_FILTER as Filter,
    liveBuffer: config.MUSIC_LIVE_BUFFER,
    highWaterMark: config.MUSIC_HIGH_WATERMARK,
    dlChunkSize: config.MUSIC_DOWNLOAD_CHUNK_SIZE,
};

export const player = Player.singleton(client, { ytdlOptions });

logger.debug('Initialised music player: ', player.options.ytdlOptions);

// Log in with token
client.login(config.DISCORD_TOKEN);
