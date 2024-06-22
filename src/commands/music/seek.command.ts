import {
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandIntegerOption,
} from '@discordjs/builders';
import { GuildQueue } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { config, embedColours } from '../../config/config';
import { Command } from '../../types/command.type';
import { logger, player } from '../../main';

export const SeekCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seeks to the given time.')
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option.setName('time').setDescription('Time').setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();
            const seekTime: number | null =
                interaction.options.getInteger('time');

            if (queue && seekTime) {
                logger.debug(`Seeking [Time: ${seekTime}s]`);

                await queue.node.seek(seekTime);
                embedBuilder.setColor(embedColours.INFO).setAuthor({
                    name: `⏩ Skipped to ${seekTime} seconds`,
                } as EmbedAuthorOptions);
            } else {
                embedBuilder.setColor(embedColours.ERROR).setAuthor({
                    name: '❌ There are no songs in the queue',
                } as EmbedAuthorOptions);
            }

            await interaction.reply({
                embeds: [embedBuilder],
            });
        }
    },
};
