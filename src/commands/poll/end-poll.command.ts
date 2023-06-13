import { Command } from '../../interfaces/Command';
import {
    ChatInputCommandInteraction,
    Client,
    EmbedAuthorOptions,
    SlashCommandBuilder,
} from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { logger, pollService } from '../../main';
import { embedColours } from '../../config/config';

export const EndPollCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('end_poll')
        .setDescription('Ends the currently running poll.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        if (pollService.poll) {
            await pollService.stopPoll();

            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: 'Poll has been ended',
            } as EmbedAuthorOptions);
        } else {
            logger.warn('There is no poll in progress');

            embedBuilder.setColor(embedColours.WARNING).setAuthor({
                name: 'There is no poll in progress',
            } as EmbedAuthorOptions);
        }

        await interaction.reply({ embeds: [embedBuilder] });
    },
};
