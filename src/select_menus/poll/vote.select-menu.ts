import { SelectMenu } from '../../types/select-menu.type';
import { Client, StringSelectMenuInteraction } from 'discord.js';
import { logger, pollService } from '../../main';

export const VoteSelectMenu: SelectMenu = {
    data: { name: 'VoteSelectMenu' },
    async run(
        client: Client,
        interaction: StringSelectMenuInteraction
    ): Promise<void> {
        if (interaction.user.id !== interaction.message.interaction?.user.id)
            return;

        await interaction.reply('Casting vote...');

        try {
            const optionIds: number[] = interaction.values.map(
                (value: string) => Number(value)
            );
            const votes: string[] = pollService.handleVote(
                optionIds,
                interaction.user.id
            );
            const message: string = `\`\`\`${
                interaction.user.username
            } voted for ${votes.join(', ')}\`\`\``;

            await interaction.channel?.send({ content: message });
        } catch (error: any) {
            const message: string = 'Failed to cast vote: ' + error.message;

            logger.error(message);
            await interaction.channel?.send({ content: message });
        } finally {
            await interaction.message.delete();
            await interaction.deleteReply();
        }
    },
};
