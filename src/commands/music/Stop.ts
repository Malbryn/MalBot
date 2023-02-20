import { Queue } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Logger } from 'tslog';
import { config } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { ExtendedClient } from '../../models/ExtendedClient';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Stop: Command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription(
            'Stops the player and kicks the bot from the voice channel.'
        ),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: Queue | undefined = client.player?.getQueue(guildId);

            if (queue) {
                logger.debug('Stopping player');

                queue.destroy();
                await interaction.reply('Player has been stopped');
            } else {
                await interaction.reply('There are no songs in the queue');
            }
        }
    },
};
