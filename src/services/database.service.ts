import path from 'path';
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { Logger } from 'tslog';
import { config } from '../config/config';
import { ServerInfo } from 'src/interfaces/ServerInfo';

export class DatabaseService {
    logger = new Logger(config.LOGGER_SETTINGS);
    sequelize: Sequelize;
    serverInfoModel: ModelStatic<Model<ServerInfo>>;

    private static instance: DatabaseService;

    private constructor() {
        this.sequelize = this.initDatabase();
        this.serverInfoModel = this.createServerInfoTable();
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }

        return DatabaseService.instance;
    }

    private initDatabase(): Sequelize {
        this.logger.info('Connecting to database...');

        return new Sequelize({
            dialect: 'sqlite',
            storage: path.resolve(__dirname, config.DATABASE_PATH),
            logging: (message: string) => this.logger.debug(message),
        });
    }

    private createServerInfoTable(): ModelStatic<Model<ServerInfo>> {
        const serverInfo: ModelStatic<Model<ServerInfo>> =
            this.sequelize.define('server_info', {
                ip: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                port: {
                    type: DataTypes.STRING,
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
                embedId: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            });

        serverInfo.sync();

        this.logger.info('Server info model synced');

        return serverInfo;
    }
}
