import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from '@discordjs/builders';
import { TextInputStyle } from 'discord.js';

export function createNewPollModal(): ModalBuilder {
    const modal: ModalBuilder = new ModalBuilder();

    const title: TextInputBuilder = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Type your question here')
        .setMaxLength(256)
        .setRequired(true);

    const options: TextInputBuilder = new TextInputBuilder()
        .setCustomId('options')
        .setLabel('Options')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(
            'Type your options here. Comma separated. Up to 10 options.'
        )
        .setMaxLength(256)
        .setRequired(true);

    const duration: TextInputBuilder = new TextInputBuilder()
        .setCustomId('duration')
        .setLabel('Duration')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Duration in minutes (Optional, default: 1 minute)')
        .setMaxLength(2)
        .setRequired(false)
        .setValue('1');

    const titleAction: ActionRowBuilder<TextInputBuilder> =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            title
        );

    const optionsAction: ActionRowBuilder<TextInputBuilder> =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            options
        );

    const durationAction: ActionRowBuilder<TextInputBuilder> =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            duration
        );

    modal.addComponents(titleAction, optionsAction, durationAction);

    return modal;
}
