import { Queue, Track } from 'discord-player';
import {
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
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                logger.debug('Skipping current song');

                const currentSong: Track = queue.current;

                queue.skip();
                embedBuilder.setColor(embedColours.INFO).setAuthor({
                    name: `⏭ Skipped ${currentSong.title}`,
                } as EmbedAuthorOptions);
            } else {
                embedBuilder;
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
