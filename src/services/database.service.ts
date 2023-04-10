import path from 'path';
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { Logger } from 'tslog';
import { config } from '../config/config';
import { ServerInfo } from 'src/interfaces/ServerInfo';

export class DatabaseService {
    logger = new Logger(config.LOGGER_SETTINGS);
    sequelize: Sequelize | undefined;
    serverInfoModel: ModelStatic<Model<ServerInfo>> | undefined;

    private static instance: DatabaseService;

    private constructor() {}

    public async init(): Promise<void> {
        this.sequelize = this.initDatabase();
        this.serverInfoModel = await this.createServerInfoTable();
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }

        return DatabaseService.instance;
    }

    public async saveServerInfo(serverInfo: ServerInfo): Promise<void> {
        if (this.serverInfoModel) {
            this.logger.info('Saving server info');

            await this.serverInfoModel.upsert(serverInfo);
        } else
            throw new Error(
                "Couldn't save server info because the model is undefined"
            );
    }

    public async getServerInfo(): Promise<Model<ServerInfo> | null> {
        if (this.serverInfoModel) {
            this.logger.info('Getting server info');

            return await this.serverInfoModel.findOne({
                order: [['createdAt', 'DESC']],
            });
        } else
            throw new Error(
                "Couldn't get server info because the model is undefined"
            );
    }

    private initDatabase(): Sequelize {
        this.logger.info('Connecting to database');

        return new Sequelize({
            dialect: 'sqlite',
            storage: path.resolve(__dirname, config.DATABASE_PATH),
            logging: (message: string) => this.logger.debug(message),
        });
    }

    private async createServerInfoTable(): Promise<
        ModelStatic<Model<ServerInfo>> | undefined
    > {
        const serverInfo: ModelStatic<Model<ServerInfo>> | undefined =
            this.sequelize?.define('server_info', {
                ip: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                port: {
                    type: DataTypes.NUMBER,
                    allowNull: false,
                },
                game: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                modset: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                channelId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                embedId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            });

        if (serverInfo) {
            await serverInfo.sync();

            this.logger.info('Server info model synced');
        } else {
            this.logger.warn('Server info model is undefined');
        }

        return serverInfo;
    }
}
