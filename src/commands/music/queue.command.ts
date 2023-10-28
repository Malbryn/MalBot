import { GuildQueue, Track } from 'discord-player';
import {
    APIEmbedField,
    ChatInputCommandInteraction,
    Client,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { config, embedColours } from '../../config/config';
import { Command } from '../../types/command.type';
import { logger, player } from '../../main';

export const QueueCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the first 5 songs in the queue.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                const tracks: Track[] = queue.tracks.store;

                logger.debug('Current queue lenght: ', tracks.length);

                const queueString: string =
                    tracks.length === 0
                        ? '*empty*'
                        : tracks
                              .slice(0, 5)
                              .map((track: Track, i: number) => {
                                  return `\`[${track.duration}]\` ${
                                      track.title
                                  } - ${
                                      track.requestedBy
                                          ? track.requestedBy.username
                                          : 'Unknown'
                                  }`;
                              })
                              .join('\n');
                const currentTrack: Track | null = queue.currentTrack;

                if (currentTrack) {
                    const currentTrackTitle: string = currentTrack
                        ? `\`[${queue.node.createProgressBar()}]\` \n ${
                              currentTrack.title
                          }`
                        : 'None';
                    const currentTrackUrl: string = currentTrack
                        ? currentTrack.url
                        : '';
                    const currentTrackThumbnail: string = currentTrack
                        ? currentTrack.thumbnail
                        : '';
                    const fields: APIEmbedField[] = [
                        { name: 'QueueCommand', value: queueString },
                    ];

                    embedBuilder
                        .setTitle(`**${currentTrackTitle}**`)
                        .setURL(currentTrackUrl)
                        .setColor(embedColours.BLUE)
                        .setThumbnail(currentTrackThumbnail)
                        .setAuthor({
                            name: `▶️ Currently playing`,
                        } as EmbedAuthorOptions)
                        .addFields(fields);
                } else {
                    embedBuilder.setColor(embedColours.RED).setAuthor({
                        name: '❌ There are no songs in the queue',
                    } as EmbedAuthorOptions);
                }
            } else {
                embedBuilder.setColor(embedColours.RED).setAuthor({
                    name: '❌ There are no songs in the queue',
                } as EmbedAuthorOptions);
            }

            await interaction.reply({
                embeds: [embedBuilder],
            });
        }
    },
};
