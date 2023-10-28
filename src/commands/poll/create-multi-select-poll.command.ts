import { Command } from '../../types/command.type';
import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
} from 'discord.js';
import { ModalBuilder } from '@discordjs/builders';
import { createNewPollModal } from '../../utils/create-poll-modal.util';

export const CreateMultiSelectPollCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('create_multi_select_poll')
        .setDescription('Creates a new multi-select poll.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const modal: ModalBuilder = createNewPollModal();

        modal
            .setCustomId('CreateMultiSelectPollModal')
            .setTitle('Create new multi-select poll');

        await interaction.showModal(modal);
    },
};
