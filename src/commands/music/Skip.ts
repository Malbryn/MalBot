import { Queue, Track } from 'discord-player';
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Logger } from 'tslog';
import { config } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { ExtendedClient } from '../../models/ExtendedClient';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Skip: Command = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: Queue | undefined = client.player?.getQueue(guildId);

            if (queue) {
                logger.debug('Skipping current song');

                const currentSong: Track = queue.current;
                queue.skip();

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${currentSong.title} has been skipped`
                            )
                            .setThumbnail(currentSong.thumbnail),
                    ],
                });
            } else {
                await interaction.reply('There are no songs in the queue');
            }
        }
    },
};
