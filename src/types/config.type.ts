import { ISettingsParam } from 'tslog/dist/types/interfaces';

export type Game = {
    id: string;
    name: string;
};

export type Config = {
    DISCORD_TOKEN: string;
    CLIENT_ID: string;
    GUILD_ID: string;
    ACTIVITY_NAME: string;
    LOGIN_RETRY_COUNT: number;
    LOGIN_RETRY_INTERVAL: number;
    LOGGER_SETTINGS: Partial<ISettingsParam<unknown>>;
    DATABASE_PATH: string;
    MUSIC_PLAYER_ACCESS_TOKEN: string;
    MUSIC_PLAYER_REFRESH_TOKEN: string;
    MUSIC_PLAYER_EXPIRY_DATE: string;
    SERVER_MONITORING_INTERVAL: number;
    SERVER_MONITORING_GAMES: Game[];
};
