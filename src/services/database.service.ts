import path from 'path';
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { ServerInfo } from 'src/types/server-info.type';
import { logger } from '../globals';
import { ConfigService } from './config.service';

export class DatabaseService {
    private static _instance: DatabaseService;

    private _configService: ConfigService = ConfigService.getInstance();

    private _sequelize: Sequelize | undefined;
    private _serverInfoModel: ModelStatic<Model<ServerInfo>> | undefined;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService._instance) {
            DatabaseService._instance = new DatabaseService();
        }

        return DatabaseService._instance;
    }

    public async init(): Promise<void> {
        logger.info('Initialising database service');

        this._sequelize = this.initDatabase();
        this._serverInfoModel = await this.createServerInfoTable();
    }

    public async saveServerInfo(serverInfo: ServerInfo): Promise<void> {
        if (!this._serverInfoModel) {
            throw new Error(
                "Couldn't save server info because the model is undefined",
            );
        }

        logger.info('Saving server info');

        await this._serverInfoModel.upsert(serverInfo);
    }

    public async getServerInfo(): Promise<Model<ServerInfo> | null> {
        if (!this._serverInfoModel) {
            throw new Error(
                "Couldn't save server info because the model is undefined",
            );
        }

        logger.info('Getting server info');

        return await this._serverInfoModel.findOne({
            order: [['createdAt', 'DESC']],
        });
    }

    public async updateRunningState(isRunning: boolean): Promise<void> {
        if (!this._serverInfoModel) {
            throw new Error(
                "Couldn't save server info because the model is undefined",
            );
        }

        logger.info(
            `Updating server monitor running state [Value: ${isRunning}]`,
        );

        const serverInfo: Model<ServerInfo, ServerInfo> | null =
            await this._serverInfoModel.findOne({
                order: [['createdAt', 'DESC']],
            });

        if (!serverInfo) {
            throw new Error('Server info is not found in the database');
        }

        await serverInfo.update({ isRunning });
    }

    private initDatabase(): Sequelize {
        logger.info('Connecting to database');

        return new Sequelize({
            dialect: 'sqlite',
            storage: path.resolve(
                __dirname,
                this._configService.get('database').path,
            ),
            logging: (message: string) => logger.debug(message),
        });
    }

    private async createServerInfoTable(): Promise<
        ModelStatic<Model<ServerInfo>> | undefined
    > {
        if (!this._sequelize) {
            logger.error('Sequelize database connection failed');
            return;
        }

        const serverInfo: ModelStatic<Model<ServerInfo>> | undefined =
            this._sequelize.define('server_info', {
                ip: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                gamePort: {
                    type: DataTypes.NUMBER,
                    allowNull: false,
                },
                queryPort: {
                    type: DataTypes.NUMBER,
                    allowNull: true,
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
                isRunning: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
            });

        if (serverInfo) {
            await serverInfo.sync();

            logger.info('Server info model synced');
        } else {
            logger.warn('Server info model is undefined');
        }

        return serverInfo;
    }
}
