import {
    ChatInputCommandInteraction,
    Client,
    Events,
    Interaction,
} from 'discord.js';
import { Logger } from 'tslog';
import { ExtendedClient } from '../models/ExtendedClient';
import { commandMap } from '../commands/_CommandList';
import { config } from '../config/config';

const logger = new Logger(config.LOGGER_SETTINGS);

export default (client: Client): void => {
    client.on(
        Events.InteractionCreate,
        async (interaction) => await onInteraction(client, interaction)
    );
};

export const onInteraction = async (
    client: Client,
    interaction: Interaction
) => {
    if (!interaction.isCommand()) return;

    const command = commandMap.get(interaction.commandName);

    if (command) {
        logger.debug(
            `Command used [Command: ${interaction.commandName}] [Requested by: ${interaction.member?.user.username}]`
        );

        await command.run(
            client as ExtendedClient,
            interaction as ChatInputCommandInteraction
        );
    }
};
