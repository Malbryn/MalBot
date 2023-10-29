import { ISettingsParam } from 'tslog/dist/types/interfaces';

export type Config = {
    DISCORD_TOKEN: string;
    GUILD_ID: string;
    CLIENT_ID: string;
    ACTIVITY_NAME: string;
    LOGIN_RETRY_COUNT: number;
    LOGIN_RETRY_INTERVAL: number;
    LOGGER_SETTINGS: Partial<ISettingsParam<unknown>>;
    SERVER_MONITORING_INTERVAL: number;
    SERVER_MONITORING_GAMES: { name: string; id: string }[];
    DATABASE_PATH: string;
    MUSIC_QUALITY: string;
    MUSIC_FILTER: string;
    MUSIC_LIVE_BUFFER: number;
    MUSIC_HIGH_WATERMARK: number;
    MUSIC_DOWNLOAD_CHUNK_SIZE: number;
};
