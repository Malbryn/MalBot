import { Command } from '../../interfaces/Command';
import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
} from 'discord.js';
import { ModalBuilder } from '@discordjs/builders';
import { createNewPollModal } from '../../utils/create-poll-modal';

export const CreateSingleSelectPollCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('create_single_select_poll')
        .setDescription('Creates a new single-select poll.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const modal: ModalBuilder = createNewPollModal();

        modal
            .setCustomId('CreateSingleSelectPollModal')
            .setTitle('Create new single-select poll');

        await interaction.showModal(modal);
    },
};
