import { GuildQueue } from 'discord-player';
import {
    ChatInputCommandInteraction,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { config, embedColours } from '../../config/config';
import { Command } from '../../types/command.type';
import { logger, player } from '../../main';

export const StopCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription(
            'Stops the player and kicks the bot from the voice channel.',
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();
        const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

        if (queue) {
            logger.debug('Stopping player');

            queue.delete();
            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: '⏹ Player has been stopped',
            } as EmbedAuthorOptions);
        } else {
            embedBuilder.setColor(embedColours.ERROR).setAuthor({
                name: '❌ There are no songs in the queue',
            } as EmbedAuthorOptions);
        }

        await interaction.reply({
            embeds: [embedBuilder],
        });
    },
};
