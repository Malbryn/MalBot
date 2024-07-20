export type ServerInfo = {
    id?: number;
    ip: string;
    gamePort: number;
    queryPort?: number;
    game: string;
    password?: string;
    modset?: string;
    channelId: string;
    embedId: string;
    isRunning: boolean;
};
