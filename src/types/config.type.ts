export type Config = {
    client: ClientConfig;
    database: DatabaseConfig;
    musicPlayer: MusicPlayerConfig;
    serverMonitor: ServerMonitorConfig;
};

export type ClientConfig = {
    discordToken: string;
    clientId: string;
    guildId: string;
    activityName: string;
    loginRetry: {
        count: number;
        intervalMs: number;
    };
};

export type DatabaseConfig = {
    path: string;
};

export type MusicPlayerConfig = {
    accessToken: string;
    refreshToken: string;
    expiryDate: string;
};

export type ServerMonitorConfig = {
    interval: number;
    games: Game[];
};

export type Game = {
    id: string;
    name: string;
};
