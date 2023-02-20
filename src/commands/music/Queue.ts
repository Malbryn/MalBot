import { Queue as PlayerQueue, Track } from 'discord-player';
import {
    APIEmbedField,
    ChatInputCommandInteraction,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Logger } from 'tslog';
import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { ExtendedClient } from '../../models/ExtendedClient';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Queue: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the first 5 songs in the queue.'),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: PlayerQueue | undefined =
                client.player?.getQueue(guildId);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                const tracks = queue.tracks;

                logger.debug('Current queue: ', tracks);

                const queueString: string =
                    tracks.length === 0
                        ? '*empty*'
                        : tracks
                              .slice(0, 5)
                              .map((song: Track, i: number) => {
                                  return `${i} - [${song.duration}]\` ${song.title} - ${song.requestedBy.username}`;
                              })
                              .join('\n');
                const currentSong: Track = queue.current;
                const currentSongTitle: string = currentSong
                    ? `\`[${currentSong.duration}]\` ${currentSong.title}`
                    : 'None';
                const fields: APIEmbedField[] = [
                    { name: 'Queue', value: queueString },
                ];

                embedBuilder
                    .setTitle(`**${currentSongTitle}**`)
                    .setURL(currentSong.url)
                    .setColor(embedColours.INFO)
                    .setThumbnail(currentSong.thumbnail)
                    .setAuthor({
                        name: `▶️ Currently playing`,
                    } as EmbedAuthorOptions)
                    .addFields(fields);
            } else {
                embedBuilder.setColor(embedColours.WARNING).setAuthor({
                    name: '❌ There are no songs in the queue',
                } as EmbedAuthorOptions);
            }

            await interaction.reply({
                embeds: [embedBuilder],
            });
        }
    },
};
