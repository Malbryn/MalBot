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

export const StopServerMonitoringCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('stop_server_monitoring')
        .setDescription('Stops the game server monitoring.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        if (serverMonitoringService.isRunning()) {
            serverMonitoringService.stop();

            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: 'Server monitoring has been stopped',
            } as EmbedAuthorOptions);
        } else {
            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: 'Server monitoring is not running',
            } as EmbedAuthorOptions);
        }

        await interaction.reply({ embeds: [embedBuilder] });
    },
};
