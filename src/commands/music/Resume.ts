import { GuildQueue } from 'discord-player';
import {
    ChatInputCommandInteraction,
    Client,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Logger } from 'tslog';
import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { player } from '../../main';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Resume: Command = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the current song.'),
    async run(client: Client, interaction: ChatInputCommandInteraction) {
        const guildId: string | null = interaction.guildId;

        if (guildId) {
            const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);
            const embedBuilder: EmbedBuilder = new EmbedBuilder();

            if (queue) {
                logger.debug('Resuming player');

                queue.node.resume();
                embedBuilder.setColor(embedColours.INFO).setAuthor({
                    name: '▶️ Player has been resumed',
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
