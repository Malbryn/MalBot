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

export const Stop: Command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription(
            'Stops the player and kicks the bot from the voice channel.'
        ),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();
        const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

        if (queue) {
            logger.debug('Stopping player');

            queue.delete();
            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: '⏹ Player has been stopped',
            } as EmbedAuthorOptions);
        } else {
            embedBuilder.setColor(embedColours.WARNING).setAuthor({
                name: '❌ There are no songs in the queue',
            } as EmbedAuthorOptions);
        }

        await interaction.reply({
            embeds: [embedBuilder],
        });
    },
};
