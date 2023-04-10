import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { Logger } from 'tslog';
import {
    ChatInputCommandInteraction,
    Client,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { serverMonitoringService } from '../../main';

const logger = new Logger(config.LOGGER_SETTINGS);

export const StartServerMonitoringCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('start_server_monitoring')
        .setDescription('Starts the game server monitoring.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        if (serverMonitoringService.isRunning()) {
            embedBuilder.setColor(embedColours.INFO).setAuthor({
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
