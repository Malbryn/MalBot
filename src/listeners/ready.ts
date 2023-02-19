import { Client } from 'discord.js';
import { commands } from '../commands';
import { Logger } from 'tslog';

const logger = new Logger();

export default (client: Client): void => {
    client.on('ready', async () => {
        if (!client.user || !client.application) {
            return;
        }

        await client.application.commands.set(commands);

        logger.info(`${client.user.username} is online`);
    });
};
