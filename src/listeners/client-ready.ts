import { Client, Events, REST, Routes } from 'discord.js';
import { Logger } from 'tslog';
import { commandMap } from '../commands/_CommandList';
import { config } from '../config/config';

const logger = new Logger(config.LOGGER_SETTINGS);

export default (client: Client): void => {
    client.once(Events.ClientReady, async () => {
        if (!client.user || !client.application) {
            return;
        }

        logger.info('Registering commands...');

        const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
        const commands = Array.from(commandMap.values());
        const commandData = commands.map((element) => element.data.toJSON());

        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commandData }
        );

        logger.info(`${client.user.username} is online`);
    });
};
