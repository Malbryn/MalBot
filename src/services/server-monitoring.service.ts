import {
    Channel,
    ChannelType,
    Collection,
    EmbedBuilder,
    Message,
    Snowflake,
} from 'discord.js';
import { GameDig, Player, QueryResult } from 'gamedig';
import { Model } from 'sequelize';
import { App } from '../app';
import { embedColours, logger } from '../globals';
import { ServerInfo, ServerQueryResult } from '../types';
import { ConfigService } from './config.service';
import { DatabaseService } from './database.service';

export class ServerMonitoringService {
    private static _instance: ServerMonitoringService;

    private _configService: ConfigService = ConfigService.getInstance();
    private _databaseService: DatabaseService = DatabaseService.getInstance();

    private _intervalId: ReturnType<typeof setInterval> | undefined;
    private _isStarted: boolean = false;

    pendingGame: string | undefined;

    private constructor() {}

    public static getInstance(): ServerMonitoringService {
        if (!ServerMonitoringService._instance) {
            ServerMonitoringService._instance = new ServerMonitoringService();
        }

        return ServerMonitoringService._instance;
    }

    public async init(): Promise<void> {
        logger.info('Initialising server monitor');

        const serverInfo: ServerInfo | undefined =
            await this.getServerInfoFromDatabase();

        if (!serverInfo) {
            logger.warn("Couldn't initialise server monitoring service");
            return;
        }

        if (!serverInfo.isRunning) {
            logger.info(
                'Server monitoring running state was set to false, cancelling initialisation',
            );
            return;
        }

        await this.start();
    }

    public async start(): Promise<void> {
        logger.info('Starting server monitor');

        const serverInfo: ServerInfo | undefined =
            await this.getServerInfoFromDatabase();

        if (!serverInfo) {
            logger.warn("Couldn't start server monitoring service");
            return;
        }

        await this.runQuery(serverInfo);

        const interval =
            this._configService.get('serverMonitor').interval * 1000;
        this._intervalId = setInterval(
            async () => await this.runQuery(serverInfo),
            interval,
        );
        this._isStarted = true;

        await this._databaseService.updateRunningState(true);
    }

    public async stop(): Promise<void> {
        logger.info('Stopping server monitor');

        if (!this._isStarted && !this._intervalId) {
            logger.warn('Server monitor is not running');
            return;
        }

        clearInterval(this._intervalId);

        this._intervalId = undefined;
        this._isStarted = false;

        await this._databaseService.updateRunningState(false);
    }

    public isRunning(): boolean {
        return this._isStarted && this._intervalId !== undefined;
    }

    public resetPendingGame(): void {
        this.pendingGame = undefined;
    }

    private async runQuery(serverInfo: ServerInfo): Promise<void> {
        try {
            const queryResult: QueryResult = await GameDig.query({
                type: serverInfo.game,
                host: serverInfo.ip,
                port: serverInfo.queryPort ?? serverInfo.gamePort,
            });
            const serverQueryResult: ServerQueryResult =
                this.parseQueryResults(queryResult);

            await this.refreshEmbed(serverInfo, serverQueryResult);
        } catch (error) {
            await this.createOfflineEmbed(serverInfo);
        }
    }

    private async getServerInfoFromDatabase(): Promise<
        Promise<ServerInfo> | undefined
    > {
        const serverInfo: Model<ServerInfo, ServerInfo> | null =
            await this._databaseService.getServerInfo();

        if (!serverInfo) {
            logger.warn('Server info not found in database');
            return;
        }

        logger.debug(
            `Server info found [ID: ${serverInfo.dataValues.id}] [Game: ${serverInfo.dataValues.game}] [Address: ${serverInfo.dataValues.ip}:${serverInfo.dataValues.gamePort}] [Is running: ${serverInfo.dataValues.isRunning}]`,
        );

        return serverInfo.dataValues;
    }

    private parseQueryResults(queryResult: QueryResult): ServerQueryResult {
        type ObjectKey = keyof typeof queryResult.raw;

        return {
            name: queryResult.name,
            map: queryResult.map,
            game: queryResult.raw!['folder' as ObjectKey] ?? '',
            ping: queryResult.ping,
            time: queryResult.raw!['time' as ObjectKey] ?? '',
            playerCount: queryResult.numplayers ?? -1,
            maxPlayerCount: queryResult.maxplayers,
            playerList: queryResult.players.map((e: Player) => ({
                name: e.name ?? '',
                time: this.convertSecondsToTimestamp(
                    e.raw!['time' as ObjectKey] ?? -1,
                ),
            })),
        };
    }

    private convertSecondsToTimestamp(time: number = -1): string {
        if (time === -1) {
            return '--:--:--';
        }

        return new Date(time * 1000).toISOString().substring(11, 19);
    }

    private async refreshEmbed(
        serverInfo: ServerInfo,
        serverQueryResult: ServerQueryResult,
    ): Promise<void> {
        const message: Message | undefined =
            await this.getEmbedMessage(serverInfo);

        if (message) {
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            embedBuilder
                .setTitle('SERVER INFO')
                .setColor(embedColours.INFO)
                .setFooter({
                    text: this.createFooter(),
                    iconURL: message.guild?.iconURL() ?? '',
                })
                .addFields(
                    {
                        name: 'Connection details',
                        value: this.createConnectionDetailsField(
                            serverInfo,
                            serverQueryResult,
                        ),
                    },
                    {
                        name: 'Modset',
                        value: this.createModsetField(serverInfo),
                    },
                    {
                        name: 'Game info',
                        value: this.createGameInfoField(serverQueryResult),
                    },
                    {
                        name: 'Player list',
                        value: this.createPlayerListField(serverQueryResult),
                    },
                );

            await message.edit({ embeds: [embedBuilder] });
        }
    }

    private async createOfflineEmbed(serverInfo: ServerInfo): Promise<void> {
        const message: Message | undefined =
            await this.getEmbedMessage(serverInfo);

        if (message) {
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            embedBuilder
                .setTitle('Server Info')
                .setDescription('```SERVER IS OFFLINE```')
                .setColor(embedColours.WARNING)
                .setFooter({
                    text: this.createFooter(),
                    iconURL: message.guild?.iconURL() ?? '',
                });

            await message.edit({ embeds: [embedBuilder] });
        }
    }

    private async getEmbedMessage(
        serverInfo: ServerInfo,
    ): Promise<Message | undefined> {
        const channel: Channel | null = await App.client.channels.fetch(
            serverInfo.channelId,
        );

        if (!channel || channel.type !== ChannelType.GuildText) {
            logger.error(
                'Embed message channel is undefined or is not a text channel',
            );
            return;
        }

        const messages: Collection<Snowflake, Message> =
            await channel.messages.fetch();
        const embedMessage: Message | undefined = messages.get(
            serverInfo.embedId,
        );

        if (!embedMessage) {
            logger.error('Embed message is not found');
            return;
        }

        return embedMessage;
    }

    private createConnectionDetailsField(
        serverInfo: ServerInfo,
        serverQueryResult: ServerQueryResult,
    ): string {
        return `
        \`\`\`\nGame: ${serverQueryResult.game}\nServer name: ${serverQueryResult.name}\nAddress: ${serverInfo.ip}:${serverInfo.gamePort}\nPassword: ${serverInfo.password}\`\`\`
        `;
    }

    private createModsetField(serverInfo: ServerInfo): string {
        if (!serverInfo.modset || serverInfo.modset === '') return '-';

        return serverInfo.modset;
    }

    private createGameInfoField(serverQueryResult: ServerQueryResult): string {
        const basicInfo: string = `
        \`\`\`\nMap: ${serverQueryResult.map}\nPlayers: ${serverQueryResult.playerCount}/${serverQueryResult.maxPlayerCount}\nPing: ${serverQueryResult.ping} ms`;
        const gameTime: string = serverQueryResult.time
            ? `\nTime: ${serverQueryResult.time}`
            : '';
        const footer: string = '```';

        return basicInfo + gameTime + footer;
    }

    private createPlayerListField(
        serverQueryResult: ServerQueryResult,
    ): string {
        const header: string = `\`\`\`\nName                     | Time\n-----------------------------------\n`;
        const footer: string = '```';
        let content: string = '';

        for (const player of serverQueryResult.playerList) {
            if (!player.name) break;

            const playerNamePadded: string = player.name.padEnd(24, ' ');
            const playerRow: string = `${playerNamePadded} | ${player.time}\n`;

            content += playerRow;
        }

        return header + content + footer;
    }

    private createFooter(): string {
        return `Last update: ${new Date().toUTCString()}`;
    }
}
