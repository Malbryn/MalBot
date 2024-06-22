import { embedColours } from '../../config/config';
import { Command } from '../../types/command.type';
import {
    ChatInputCommandInteraction,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { serverMonitoringService } from '../../main';

export const StartServerMonitoringCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('start_server_monitoring')
        .setDescription('Starts the game server monitoring.'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        if (serverMonitoringService.isRunning()) {
            embedBuilder.setColor(embedColours.WARNING).setAuthor({
                name: 'Server monitoring is already running',
            } as EmbedAuthorOptions);
        } else {
            serverMonitoringService.start();

            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: 'Server monitoring has been started',
            } as EmbedAuthorOptions);
        }

        await interaction.reply({ embeds: [embedBuilder] });
    },
};
