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

export const StopCommand: Command = {
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
            embedBuilder.setColor(embedColours.BLUE).setAuthor({
                name: '⏹ Player has been stopped',
            } as EmbedAuthorOptions);
        } else {
            embedBuilder.setColor(embedColours.RED).setAuthor({
                name: '❌ There are no songs in the queue',
            } as EmbedAuthorOptions);
        }

        await interaction.reply({
            embeds: [embedBuilder],
        });
    },
};
