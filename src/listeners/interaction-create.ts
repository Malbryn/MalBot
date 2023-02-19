import { Client, Events, Interaction } from 'discord.js';
import { Logger } from 'tslog';
import { commandList } from '../commands/_CommandList';
import { config } from '../config/config';

const logger = new Logger(config.LOGGER_SETTINGS);

export default (client: Client): void => {
    client.on(
        Events.InteractionCreate,
        async (interaction) => await onInteraction(interaction)
    );
};

export const onInteraction = async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    for (const command of commandList) {
        if (interaction.commandName === command.data.name) {
            logger.info(
                `[Command: ${interaction.commandName}] [Requested by: ${interaction.member?.user.username}]`
            );

            await command.run(interaction);
            break;
        }
    }
};
