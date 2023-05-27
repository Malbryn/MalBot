import { Logger } from 'tslog';
import { config, embedColours } from '../config/config';
import Gamedig, { Type } from 'gamedig';
import { ServerInfo } from '../interfaces/ServerInfo';
import { Model } from 'sequelize';
import { ServerQueryResult } from '../interfaces/ServerQueryResult';
import { client, databaseService } from '../main';
import { Collection, EmbedBuilder, Message, TextChannel } from 'discord.js';

export class ServerMonitoringService {
    logger = new Logger(config.LOGGER_SETTINGS);
    gamedig: Gamedig = new Gamedig();
    isStarted: boolean = false;
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
                this.handleInterval(serverInfo);

                this.intervalId = setInterval(
                    () => this.handleInterval(serverInfo),
                    ServerMonitoringService.INTERVAL * 1000
                );

                this.isStarted = true;
            })
            .catch((reason: Error) => this.logger.error(reason.message));
    }

    public stop(): void {
        this.logger.info('Stopping server monitor');

        if (this.isStarted && this.intervalId) {
            clearInterval(this.intervalId);

            this.intervalId = undefined;
            this.isStarted = false;
        } else {
            this.logger.warn('Server monitor is not running');
        }
    }

    public isRunning(): boolean {
        return this.isStarted && this.intervalId !== undefined;
    }

    private handleInterval(serverInfo: ServerInfo): void {
        this.gamedig
            .query({
                type: serverInfo.game as Type,
                host: serverInfo.ip,
                port: serverInfo.port,
            })
            .then((result: Gamedig.QueryResult) => {
                const serverQueryResult: ServerQueryResult =
                    this.parseQueryResults(result);

                this.refreshEmbed(serverInfo, serverQueryResult);
            })
            .catch(() => {
                this.createOfflineEmbed(serverInfo);

                this.logger.warn('Server is offline');
            });
    }

    private async getServerInfoFromDatabase(): Promise<ServerInfo> {
        const serverInfo: Model<ServerInfo, ServerInfo> | null =
            await databaseService.getServerInfo();

        if (serverInfo) {
            this.logger.debug(
                `Server info found [ID: ${serverInfo.dataValues.id}] [Game: ${serverInfo.dataValues.game}] [Address: ${serverInfo.dataValues.ip}:${serverInfo.dataValues.port}]`
            );

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
            time: queryResult.raw!['time' as ObjectKey] ?? '',
            currentPlayerCount:
                queryResult.raw!['numplayers' as ObjectKey] ?? -1,
            maxPlayerCount: queryResult.maxplayers,
            playerList: queryResult.players.map((e: Gamedig.Player) => ({
                name: e.name ?? '',
                time: this.convertSecondsToTimestamp(
                    e.raw!['time' as ObjectKey] ?? undefined
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

    private async refreshEmbed(
        serverInfo: ServerInfo,
        serverQueryResult: ServerQueryResult
    ): Promise<void> {
        const message: Message<true> | undefined = await this.getEmbedMessage(
            serverInfo
        );

        if (message) {
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            embedBuilder
                .setTitle('Server Info')
                .setColor(embedColours.INFO)
                .setFooter({
                    text: this.createFooter(),
                    iconURL: 'https://probot.media/tUE1WGMdwV.png',
                })
                .addFields(
                    {
                        name: 'Connection details',
                        value: this.createConnectionDetailsField(
                            serverInfo,
                            serverQueryResult
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
                    }
                );

            await message.edit({ embeds: [embedBuilder] });
        }
    }

    private async createOfflineEmbed(serverInfo: ServerInfo): Promise<void> {
        const message: Message<true> | undefined = await this.getEmbedMessage(
            serverInfo
        );

        if (message) {
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            embedBuilder
                .setTitle('Server Info')
                .setDescription('```SERVER IS OFFLINE```')
                .setColor(embedColours.ERROR)
                .setFooter({
                    text: this.createFooter(),
                    iconURL: 'https://probot.media/tUE1WGMdwV.png',
                });

            await message.edit({ embeds: [embedBuilder] });
        }
    }

    private async getEmbedMessage(
        serverInfo: ServerInfo
    ): Promise<Message<true> | undefined> {
        const channel: TextChannel | undefined = client.channels.cache.get(
            serverInfo.channelId
        ) as TextChannel;

        if (!channel) {
            this.logger.error('Channel is not found');
            return undefined;
        }

        const messageCollection: Collection<
            string,
            Message<true>
        > = await channel.messages.fetch();
        const message: Message<true> | undefined = messageCollection.get(
            serverInfo.embedId
        );

        if (!message) {
            this.logger.error('Message is not found');
            return undefined;
        }

        return message;
    }

    private createConnectionDetailsField(
        serverInfo: ServerInfo,
        serverQueryResult: ServerQueryResult
    ): string {
        return `
        \`\`\`\nGame: ${serverQueryResult.game}\nServer name: ${serverQueryResult.serverName}\nAddress: ${serverInfo.ip}:${serverInfo.port}\nPassword: ${serverInfo.password}\`\`\`
        `;
    }

    private createModsetField(serverInfo: ServerInfo): string {
        if (!serverInfo.modset || serverInfo.modset === '') return '-';

        return serverInfo.modset;
    }

    private createGameInfoField(serverQueryResult: ServerQueryResult): string {
        const basicInfo: string = `
        \`\`\`\nPlayers: ${serverQueryResult.currentPlayerCount}/${serverQueryResult.maxPlayerCount}\nPing: ${serverQueryResult.ping} ms`;
        const gameTime: string = serverQueryResult.time
            ? `\nTime: ${serverQueryResult.time}`
            : '';
        const footer: string = '```';

        return basicInfo + gameTime + footer;
    }

    private createPlayerListField(
        serverQueryResult: ServerQueryResult
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
