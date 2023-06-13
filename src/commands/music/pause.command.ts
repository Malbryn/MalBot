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

export const PauseCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current song.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                logger.debug('Pausing player');

                queue.node.pause();
                embedBuilder.setColor(embedColours.BLUE).setAuthor({
                    name: '⏸ Player has been paused',
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
