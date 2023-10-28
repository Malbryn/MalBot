import {
    Events,
    REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import { commandMap } from '../commands/_CommandList';
import { config } from '../config/config';
import { Command } from '../types/command.type';
import { client, logger } from '../main';

export default (): void => {
    client.once(Events.ClientReady, async (): Promise<void> => {
        if (!client.user || !client.application) {
            return;
        }

        logger.info('Registering commands');

        const rest: REST = new REST({ version: '10' }).setToken(
            config.DISCORD_TOKEN
        );
        const commands: Command[] = Array.from(commandMap.values());
        const commandData: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
            commands.map((element: Command) => element.data.toJSON());

        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commandData }
        );

        logger.info(`${client.user.username} is online`);
    });
};
