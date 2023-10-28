import { Modal } from '../../types/modal.type';
import { Client, ModalSubmitInteraction } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { Poll } from '../../types/poll.type';
import { pollService } from '../../main';
import { handlePollModal } from '../../utils/handle-poll-modal.util';
import { createPollEmbed } from '../../utils/create-poll-embed.util';

export const CreateMultiSelectPollModal: Modal = {
    data: { name: 'CreateMultiSelectPollModal' },
    async run(
        client: Client,
        interaction: ModalSubmitInteraction
    ): Promise<void> {
        await interaction.reply('Creating new poll...');

        const poll: Poll = handlePollModal(interaction, true);
        const embedBuilder: EmbedBuilder = createPollEmbed(poll, interaction);

        await interaction.deleteReply();
        await interaction.channel?.send({
            embeds: [embedBuilder],
        });

        // Start monitoring votes
        await pollService.startPoll(poll);
    },
};
