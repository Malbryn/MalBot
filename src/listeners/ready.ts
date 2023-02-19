import { Client } from 'discord.js';
import { Logger } from 'tslog';
import { commands } from '../commands';
import * as config from '../../config.json';

const logger = new Logger(config.loggerConfig);

export default (client: Client): void => {
    client.on('ready', async () => {
        if (!client.user || !client.application) {
            return;
        }

        await client.application.commands.set(commands);

        logger.info(`${client.user.username} is online`);
    });
};
