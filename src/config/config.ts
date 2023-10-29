import { Config } from '../types/config.type';
import { ColourPalette } from '../types/colour-palette.type';

const appConfig = require('../../config/config.json');

export const config: Config = {
    DISCORD_TOKEN: appConfig.client.discordToken,
    GUILD_ID: appConfig.client.guildID,
    CLIENT_ID: appConfig.client.clientID,
    ACTIVITY_NAME: appConfig.client.activityName,
    LOGIN_RETRY_COUNT: appConfig.client.loginRetryCount,
    LOGIN_RETRY_INTERVAL: appConfig.client.loginRetryIntervalMs,
    LOGGER_SETTINGS: appConfig.loggerSettings,
    SERVER_MONITORING_INTERVAL: appConfig.serverMonitoring.interval,
    SERVER_MONITORING_GAMES: appConfig.serverMonitoring.games,
    DATABASE_PATH: appConfig.database.path,
    MUSIC_QUALITY: appConfig.music.quality,
    MUSIC_FILTER: appConfig.music.filter,
    MUSIC_LIVE_BUFFER: appConfig.music.liveBuffer,
    MUSIC_HIGH_WATERMARK: appConfig.music.highWaterMark,
    MUSIC_DOWNLOAD_CHUNK_SIZE: appConfig.music.dlChunkSize,
};

export const embedColours: ColourPalette = {
    GREEN: [87, 242, 135],
    BLUE: [88, 101, 242],
    YELLOW: [254, 231, 92],
    RED: [237, 66, 69],
};
