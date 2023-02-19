import * as appConfig from '../../config/config.json';

export const config = {
    DISCORD_TOKEN: appConfig.client.discordToken,
    GUILD_ID: appConfig.client.guildID,
    CLIENT_ID: appConfig.client.clientID,
    LOGGER_SETTINGS: appConfig.loggerSettings,
};
