import { Queue as PlayerQueue, Track } from 'discord-player';
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

export const Queue: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the first 10 songs in the queue.'),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: PlayerQueue | undefined =
                client.player?.getQueue(guildId);

            if (queue) {
                const queueString: string = queue.tracks
                    .slice(0, 10)
                    .map((song: Track, i: number) => {
                        return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`;
                    })
                    .join('\n');

                logger.debug('Current queue: ', queue.tracks);

                const currentSong: Track = queue.current;

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**Currently Playing**\n` +
                                    (currentSong
                                        ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>`
                                        : 'None') +
                                    `\n\n**Queue**\n${queueString}`
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
