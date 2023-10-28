import { SelectMenu } from '../../types/select-menu.type';
import {
    Client,
    StringSelectMenuInteraction,
    TextInputStyle,
} from 'discord.js';
import { logger, serverMonitoringService } from '../../main';
import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from '@discordjs/builders';

export const ServerMonitorSelectMenu: SelectMenu = {
    data: { name: 'ServerMonitorSelectMenu' },
    async run(
        client: Client,
        interaction: StringSelectMenuInteraction
    ): Promise<void> {
        if (interaction.user.id !== interaction.message.interaction?.user.id)
            return;

        serverMonitoringService.pendingGame =
            interaction.values[0] ?? undefined;

        try {
            const modal: ModalBuilder = new ModalBuilder()
                .setCustomId('CreateServerInfoModal')
                .setTitle('Create new server info panel');

            const ip: TextInputBuilder = new TextInputBuilder()
                .setCustomId('serverIP')
                .setLabel('IP')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Server IP')
                .setMinLength(7)
                .setMaxLength(15)
                .setRequired(true);

            const port: TextInputBuilder = new TextInputBuilder()
                .setCustomId('serverPort')
                .setLabel('Port')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Server port')
                .setMinLength(4)
                .setMaxLength(5)
                .setRequired(true);

            const modset: TextInputBuilder = new TextInputBuilder()
                .setCustomId('modset')
                .setLabel('Modset link (Optional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Link to modset')
                .setRequired(false);

            const password: TextInputBuilder = new TextInputBuilder()
                .setCustomId('password')
                .setLabel('Server password (Optional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Server password')
                .setRequired(false);

            const ipAction: ActionRowBuilder<TextInputBuilder> =
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    ip
                );
            const portAction: ActionRowBuilder<TextInputBuilder> =
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    port
                );
            const modsetAction: ActionRowBuilder<TextInputBuilder> =
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    modset
                );
            const passwordAction: ActionRowBuilder<TextInputBuilder> =
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    password
                );

            modal.addComponents(
                ipAction,
                portAction,
                modsetAction,
                passwordAction
            );

            await interaction.showModal(modal);
        } catch (error: any) {
            const message: string = 'Failed to select game: ' + error.message;

            logger.error(message);
            await interaction.channel?.send({ content: message });
        } finally {
            await interaction.message.delete();
        }
    },
};
