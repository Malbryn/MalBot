import {
    ChatInputCommandInteraction,
    Client,
    Events,
    Interaction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import { Command } from '../types/command.type';
import { Modal } from '../types/modal.type';
import { modalMap } from '../modals/_ModalList';
import { commandMap } from '../commands/_CommandList';
import { client, logger } from '../main';
import { SelectMenu } from '../types/select-menu.type';
import { selectMenuMap } from '../select_menus/_SelectMenuList';

export default (): void => {
    client.on(
        Events.InteractionCreate,
        async (interaction) => await onInteraction(client, interaction),
    );
};

const onInteraction = async (
    client: Client,
    interaction: Interaction,
): Promise<void> => {
    if (interaction.isCommand()) {
        const command: Command | undefined = commandMap.get(
            interaction.commandName,
        );

        if (command) {
            logger.debug(
                `Command used [Command: ${interaction.commandName}] [Requested by: ${interaction.member?.user.username}]`,
            );

            await command.execute(interaction as ChatInputCommandInteraction);
        } else logger.error(`Command is not found: ${interaction.commandName}`);
    }

    if (interaction.isModalSubmit()) {
        const modal: Modal | undefined = modalMap.get(interaction.customId);

        if (modal) {
            logger.debug(`Handling modal: ${interaction.customId}`);

            await modal.execute(interaction as ModalSubmitInteraction);
        } else logger.error(`Modal is not found: ${interaction.customId}`);
    }

    if (interaction.isStringSelectMenu()) {
        const selectMenu: SelectMenu | undefined = selectMenuMap.get(
            interaction.customId,
        );

        if (selectMenu) {
            await selectMenu.run(
                client as Client,
                interaction as StringSelectMenuInteraction,
            );
        } else
            logger.error(`Select menu is not found: ${interaction.customId}`);
    }
};
