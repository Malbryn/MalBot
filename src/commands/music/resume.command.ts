import { GuildQueue } from 'discord-player';
import {
    ChatInputCommandInteraction,
    Client,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { logger, player } from '../../main';

export const ResumeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the current song.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                logger.debug('Resuming player');

                queue.node.resume();
                embedBuilder.setColor(embedColours.BLUE).setAuthor({
                    name: '▶️ Player has been resumed',
                } as EmbedAuthorOptions);
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
