export interface ServerQueryResult {
    serverName: string;
    map: string;
    game: string;
    ping: number;
    time?: string;
    currentPlayerCount: number;
    maxPlayerCount: number;
    playerList: {
        name: string;
        time: string;
    }[];
}
