import {
    ChatInputCommandInteraction,
    Client,
    Events,
    Interaction,
    ModalSubmitInteraction,
} from 'discord.js';
import { Command } from '../interfaces/Command';
import { Modal } from '../interfaces/Modal';
import { modalMap } from '../modals/_ModalList';
import { Logger } from 'tslog';
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
    if (interaction.isCommand()) {
        const command: Command | undefined = commandMap.get(
            interaction.commandName
        );

        if (command) {
            logger.debug(
                `Command used [Command: ${interaction.commandName}] [Requested by: ${interaction.member?.user.username}]`
            );

            await command.run(
                client as Client,
                interaction as ChatInputCommandInteraction
            );
        } else logger.error(`Command is not found: ${interaction.commandName}`);
    }

    if (interaction.isModalSubmit()) {
        const modal: Modal | undefined = modalMap.get(interaction.customId);

        if (modal) {
            logger.debug(`Handling modal [${interaction.customId}]`);

            await modal.run(
                client as Client,
                interaction as ModalSubmitInteraction
            );
        } else logger.error(`Modal is not found: ${interaction.customId}`);
    }
};
