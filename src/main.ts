export {};

import { Player } from 'discord-player';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { Model, ModelStatic, Sequelize } from 'sequelize';
import { Logger } from 'tslog';
import { Filter, downloadOptions } from 'ytdl-core';
import { config } from './config/config';
import { createServerInfoTable, initDatabase } from './lib/database';
import handleClientReady from './listeners/client-ready';
import handleInteractionCreate from './listeners/interaction-create';
import { ServerInfo } from './interfaces/ServerInfo';

const logger = new Logger(config.LOGGER_SETTINGS);

logger.info('Starting bot...');
logger.info(`Version ${process.env.npm_package_version}`);
logger.info(`Guild ID: ${config.GUILD_ID}`);

// Initialise client
const client: Client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    presence: {
        activities: [{ name: 'Bottom Gear', type: ActivityType.Watching }],
    },
});

// Initialise events
handleClientReady(client);
handleInteractionCreate(client);

// Connect to database
const sequelize: Sequelize = initDatabase();
export const serverInfoModel: ModelStatic<Model<ServerInfo>> =
    createServerInfoTable(sequelize);

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
