import { DatabaseService } from './services/database.service';
import { Player } from 'discord-player';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { Logger } from 'tslog';
import { downloadOptions, Filter } from 'ytdl-core';
import { config } from './config/config';
import handleClientReady from './listeners/client-ready.listener';
import handleInteractionCreate from './listeners/interaction-create.listener';
import { ServerMonitoringService } from './services/server-monitoring.service';
import { retry } from './utils/retry.util';

export {};

export const logger = new Logger(config.LOGGER_SETTINGS);

logger.info('Starting bot');
logger.info(`Version ${process.env.npm_package_version}`);
logger.info(`Guild ID: ${config.GUILD_ID}`);

// Initialise client
export const client: Client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    presence: {
        activities: [
            { name: config.ACTIVITY_NAME, type: ActivityType.Watching },
        ],
    },
});

// Initialise event listeners
handleClientReady();
handleInteractionCreate();

// Initialise services
export const databaseService: DatabaseService = DatabaseService.getInstance();
export const serverMonitoringService: ServerMonitoringService =
    ServerMonitoringService.getInstance();

databaseService
    .init()
    .then(() => {
        serverMonitoringService.start();
    })
    .catch((error: Error) => {
        logger.error(error.message);
    });

// Initialise music player
const ytdlOptions: Partial<downloadOptions> = {
    quality: config.MUSIC_QUALITY,
    filter: config.MUSIC_FILTER as Filter,
    liveBuffer: config.MUSIC_LIVE_BUFFER,
    highWaterMark: config.MUSIC_HIGH_WATERMARK,
    dlChunkSize: config.MUSIC_DOWNLOAD_CHUNK_SIZE,
};

export const player: Player = Player.singleton(client, { ytdlOptions });

logger.debug('Initialised music player: ', player.options.ytdlOptions);

// Log in with token
retry(
    () => client.login(config.DISCORD_TOKEN),
    config.LOGIN_RETRY_COUNT,
    config.LOGIN_RETRY_INTERVAL,
).catch((error) => {
    logger.error(
        `Failed to log in after (${config.LOGIN_RETRY_COUNT}) attempts: ${error.message}`,
    );

    process.exit(1);
});
