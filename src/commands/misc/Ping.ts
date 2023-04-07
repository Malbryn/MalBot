import {
    ChatInputCommandInteraction,
    Client,
    EmbedAuthorOptions,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
} from 'discord.js';
import { Logger } from 'tslog';
import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';

const logger = new Logger(config.LOGGER_SETTINGS);

export const Ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot and returns the latency.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();
        embedBuilder.setColor(embedColours.INFO).setAuthor({
            name: '⏱ Measuring latency...',
        } as EmbedAuthorOptions);

        const reply: Message<boolean> = await interaction.reply({
            embeds: [embedBuilder],
            fetchReply: true,
        });
        const latency: number =
            reply.createdTimestamp - interaction.createdTimestamp;

        embedBuilder.setAuthor({
            name: `⏱ Latency: ${latency}ms`,
        } as EmbedAuthorOptions);
        interaction.editReply({ embeds: [embedBuilder] });

        logger.debug(`Latency: ${latency}ms`);
    },
};
