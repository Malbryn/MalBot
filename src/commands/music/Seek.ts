import {
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandIntegerOption,
} from '@discordjs/builders';
import { Queue } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { ExtendedClient } from '../../models/ExtendedClient';
import { Logger } from 'tslog';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Seek: Command = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seeks to the given time.')
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option.setName('time').setDescription('Time').setRequired(true)
        ),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: Queue | undefined = client.player?.getQueue(guildId);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();
            const seekTime: number | null =
                interaction.options.getInteger('time');

            if (queue && seekTime) {
                logger.debug(`Seeking [Time: ${seekTime}]`);

                await queue.seek(seekTime);
                embedBuilder.setColor(embedColours.INFO).setAuthor({
                    name: `⏩ Skipped to ${seekTime} seconds`,
                } as EmbedAuthorOptions);
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
