import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from '@discordjs/builders';
import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    TextInputStyle,
} from 'discord.js';
import { Logger } from 'tslog';
import { config } from '../../config/config';
import { Command } from '../../interfaces/Command';

const logger = new Logger(config.LOGGER_SETTINGS);

export const CreateServerCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('create_server_info_panel')
        .setDescription('Creates the server info panel.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const modal: ModalBuilder = new ModalBuilder()
            .setCustomId('CreateServerInfoModal')
            .setTitle('CreateServerCommand new server info panel');

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

        modal.addComponents(ipAction, portAction, modsetAction, passwordAction);

        await interaction.showModal(modal);
    },
};