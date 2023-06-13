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
    GREEN: RGBTuple;
    BLUE: RGBTuple;
    YELLOW: RGBTuple;
    RED: RGBTuple;
}

export const embedColours: ColourPalette = {
    GREEN: [87, 242, 135],
    BLUE: [88, 101, 242],
    YELLOW: [254, 231, 92],
    RED: [237, 66, 69],
};
