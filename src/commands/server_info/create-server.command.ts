import { ActionRowBuilder } from '@discordjs/builders';
import {
    AnyComponentBuilder,
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Command } from '../../types/command.type';
import { config } from '../../config/config';

export const CreateServerCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('create_server_info_panel')
        .setDescription('Creates the server info panel.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const selectMenu: StringSelectMenuBuilder =
            new StringSelectMenuBuilder()
                .setCustomId('ServerMonitorSelectMenu')
                .setPlaceholder('Select a game')
                .setMinValues(1)
                .setMaxValues(1);

        const gameOptions = [...config.SERVER_MONITORING_GAMES];

        for (const gameOption of gameOptions) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(gameOption.name)
                    .setValue(gameOption.id)
            );
        }

        const actionRow: ActionRowBuilder<AnyComponentBuilder> =
            new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Select a game',
            // @ts-ignore
            components: [actionRow],
        });
    },
};
