import { Logger } from 'tslog';
import { config } from '../config/config';
import Gamedig, { Type } from 'gamedig';
import { ServerInfo } from '../interfaces/ServerInfo';
import { DatabaseService } from './database.service';
import { Model } from 'sequelize';
import { ServerQueryResult } from '../interfaces/ServerQueryResult';

export class ServerMonitoringService {
    logger = new Logger(config.LOGGER_SETTINGS);
    gamedig: Gamedig = new Gamedig();
    isRunning: boolean = false;
    intervalId: ReturnType<typeof setInterval> | undefined;

    private static instance: ServerMonitoringService;
    static readonly INTERVAL = config.SERVER_MONITORING_INTERVAL;

    private constructor() {}

    public static getInstance(): ServerMonitoringService {
        if (!ServerMonitoringService.instance) {
            ServerMonitoringService.instance = new ServerMonitoringService();
        }

        return ServerMonitoringService.instance;
    }

    public start(): void {
        this.logger.info('Starting server monitor');

        this.getServerInfoFromDatabase()
            .then((serverInfo: ServerInfo) => {
                this.intervalId = setInterval(
                    () => this.handleInterval(serverInfo),
                    ServerMonitoringService.INTERVAL * 1000
                );

                this.isRunning = true;
            })
            .catch((reason: Error) => this.logger.error(reason));
    }

    public stop(): void {
        this.logger.info('Stopping server monitor');

        if (this.isRunning && this.intervalId) {
            clearInterval(this.intervalId);

            this.intervalId = undefined;
            this.isRunning = false;
        } else {
            this.logger.warn('Server monitor is not running');
        }
    }

    private handleInterval(serverInfo: ServerInfo): void {
        this.gamedig
            .query({
                type: serverInfo.game as Type,
                host: serverInfo.ip,
                port: Number.parseInt(serverInfo.port),
            })
            .then((result: Gamedig.QueryResult) => {
                const serverQueryResult: ServerQueryResult =
                    this.parseQueryResults(result);

                this.logger.debug(serverQueryResult);
            })
            .catch(() => {
                this.logger.warn('Server is offline');
            });
    }

    private async getServerInfoFromDatabase(): Promise<ServerInfo> {
        const databaseService: DatabaseService = DatabaseService.getInstance();
        const serverInfo: Model<ServerInfo, ServerInfo> | null =
            await databaseService.serverInfoModel.findOne({
                order: [['createdAt', 'DESC']],
            });

        if (serverInfo) {
            this.logger.debug('Server info found: ', serverInfo);

            return serverInfo.dataValues;
        } else throw new Error('Server info is not found in database');
    }

    private parseQueryResults(
        queryResult: Gamedig.QueryResult
    ): ServerQueryResult {
        type ObjectKey = keyof typeof queryResult.raw;

        return {
            serverName: queryResult.name,
            map: queryResult.map,
            game: queryResult.raw!['folder' as ObjectKey] ?? '',
            ping: queryResult.ping,
            currentPlayerCount:
                queryResult.raw!['numplayers' as ObjectKey] ?? -1,
            maxPlayerCount: queryResult.maxplayers,
            playerList: queryResult.players.map((e: Gamedig.Player) => ({
                name: e.name ?? '',
                time: this.convertSecondsToTimestamp(
                    e.raw ? e.raw['time' as ObjectKey] : undefined
                ),
            })),
        };
    }

    private convertSecondsToTimestamp(time: number | undefined): string {
        if (time) {
            return new Date(time * 1000).toISOString().substring(11, 19);
        } else {
            return '--:--:--';
        }
    }
}
