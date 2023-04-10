import { RGBTuple } from 'discord.js';

const appConfig = require('../../config/config.json');

export const config = {
    DISCORD_TOKEN: appConfig.client.discordToken,
    GUILD_ID: appConfig.client.guildID,
    CLIENT_ID: appConfig.client.clientID,
    ACTIVITY_NAME: appConfig.client.activityName,
    LOGGER_SETTINGS: appConfig.loggerSettings,
    DATABASE_PATH: appConfig.database.path,
    SERVER_MONITORING_INTERVAL: appConfig.serverMonitoring.interval,
    MUSIC_QUALITY: appConfig.music.quality,
    MUSIC_FILTER: appConfig.music.filter,
    MUSIC_LIVE_BUFFER: appConfig.music.liveBuffer,
    MUSIC_HIGH_WATERMARK: appConfig.music.highWaterMark,
    MUSIC_DOWNLOAD_CHUNK_SIZE: appConfig.music.dlChunkSize,
};

export interface ColourPalette {
    INFO: RGBTuple;
    WARNING: RGBTuple;
    ERROR: RGBTuple;
}

export const embedColours: ColourPalette = {
    INFO: [74, 144, 226],
    WARNING: [248, 231, 28],
    ERROR: [208, 2, 27],
};
