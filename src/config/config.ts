import { Config } from '../types/config.type';
import { ColourPalette } from '../types/colour-palette.type';

const appConfig = require('../../config/config.json');

export const config: Config = {
    DISCORD_TOKEN: appConfig.client.discordToken,
    CLIENT_ID: appConfig.client.clientID,
    GUILD_ID: appConfig.client.guildID,
    ACTIVITY_NAME: appConfig.client.activityName,
    LOGIN_RETRY_COUNT: appConfig.client.loginRetryCount,
    LOGIN_RETRY_INTERVAL: appConfig.client.loginRetryIntervalMs,
    LOGGER_SETTINGS: appConfig.loggerSettings,
    DATABASE_PATH: appConfig.database.path,
    MUSIC_PLAYER_ACCESS_TOKEN: appConfig.MUSIC_PLAYER_ACCESS_TOKEN,
    MUSIC_PLAYER_REFRESH_TOKEN: appConfig.MUSIC_PLAYER_REFRESH_TOKEN,
    MUSIC_PLAYER_EXPIRY_DATE: appConfig.MUSIC_PLAYER_EXPIRY_DATE,
    SERVER_MONITORING_INTERVAL: appConfig.serverMonitoring.interval,
    SERVER_MONITORING_GAMES: appConfig.serverMonitoring.games,
};

export const embedColours: ColourPalette = {
    DEBUG: [87, 242, 135],
    INFO: [88, 101, 242],
    WARNING: [254, 231, 92],
    ERROR: [237, 66, 69],
};
