import path from 'path';
import { DataTypes, Model, ModelCtor, ModelStatic, Sequelize } from 'sequelize';
import { Logger } from 'tslog';
import { config } from '../config/config';
import { ServerInfo } from 'src/interfaces/ServerInfo';

const logger = new Logger(config.LOGGER_SETTINGS);

export function initDatabase(): Sequelize {
    logger.info('Connecting to database...');

    return new Sequelize({
        dialect: 'sqlite',
        storage: path.resolve(__dirname, config.DATABASE_PATH),
        // logging: (message: string) => logger.debug(message),
    });
}

export function createServerInfoTable(
    sequelize: Sequelize
): ModelStatic<Model> {
    const serverInfo: ModelStatic<Model<ServerInfo>> = sequelize.define(
        'server_info',
        {
            ip: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            port: {
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
        }
    );

    serverInfo.sync();

    logger.info('Server info synced');

    return serverInfo;
}
