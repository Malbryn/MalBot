import { Queue } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from 'src/interfaces/Command';
import { ExtendedClient } from 'src/models/ExtendedClient';
import { Logger } from 'tslog';
import { config } from '../config/config';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Pause: Command = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current song.'),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: Queue | undefined = client.player?.getQueue(guildId);

            if (queue) {
                logger.debug('Pausing player');

                queue.setPaused(true);
                await interaction.reply('Player has been paused');
            } else {
                await interaction.reply('There are no songs in the queue');
            }
        }
    },
};
