import { EmbedBuilder } from '@discordjs/builders';
import { Poll } from '../interfaces/Poll';
import { embedColours } from '../config/config';
import { APIEmbedField, ModalSubmitInteraction } from 'discord.js';
import { indexEmojiMap } from './index-emojis';

export function createPollEmbed(
    poll: Poll,
    interaction: ModalSubmitInteraction
): EmbedBuilder {
    // Pair index emojis with options and create the embed fields
    let fields: APIEmbedField[] = [];

    for (const [index, pollOption] of poll.options.entries()) {
        const indexEmoji: string = indexEmojiMap.get(index) ?? '';
        const name: string = `${indexEmoji} ${pollOption.name}`;

        fields.push({ name, value: ' ' });
    }

    // Create embed
    const embedBuilder: EmbedBuilder = new EmbedBuilder();

    embedBuilder
        .setTitle(poll.title)
        .setDescription(`Duration: ${poll.duration} minutes`)
        .setColor(embedColours.INFO)
        .setFooter({
            text: `Poll created by ${interaction.user.username}`,
            iconURL: 'https://probot.media/tUE1WGMdwV.png',
        })
        .addFields(fields);

    return embedBuilder;
}
