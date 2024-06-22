import { GuildQueue, Track } from 'discord-player';
import {
    ChatInputCommandInteraction,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { config, embedColours } from '../../config/config';
import { Command } from '../../types/command.type';
import { logger, player } from '../../main';

export const SkipCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                logger.debug('Skipping current song');

                const currentSong: Track | null = queue.currentTrack;

                if (currentSong) {
                    queue.node.skip();
                    embedBuilder.setColor(embedColours.BLUE).setAuthor({
                        name: `⏭ Skipped ${currentSong.title}`,
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
