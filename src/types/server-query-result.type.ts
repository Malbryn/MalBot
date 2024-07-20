export type ServerQueryResult = {
    name: string;
    map: string;
    game: string;
    ping: number;
    time?: string;
    playerCount: number;
    maxPlayerCount: number;
    playerList: {
        name: string;
        time: string;
    }[];
};
