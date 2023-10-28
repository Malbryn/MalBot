import { ModalSubmitInteraction } from 'discord.js';
import { PollOption } from '../types/poll-option.type';
import { Poll } from '../types/poll.type';

export function handlePollModal(
    interaction: ModalSubmitInteraction,
    allowMultiple: boolean
): Poll {
    // Get poll data from modal
    const title: string = interaction.fields.getTextInputValue('title');

    const rawDuration: number = Number.parseInt(
        interaction.fields.getTextInputValue('duration')
    );
    const duration: number = Number.isNaN(rawDuration) ? 1 : rawDuration;

    const rawOptions: string = interaction.fields.getTextInputValue('options');
    const optionsArray: string[] = rawOptions
        .split(/,+/)
        .slice(0, 10)
        .map((value: string) => value.trim())
        .filter((value: string) => value !== '');
    const options: Map<number, PollOption> = new Map<number, PollOption>();

    for (const [index, option] of optionsArray.entries()) {
        const pollOption: PollOption = {
            id: index,
            name: option,
            voteCount: 0,
        };

        options.set(index, pollOption);
    }

    // Create new poll object
    return {
        title,
        duration: duration,
        options,
        allowMultiple,
        channelId: interaction?.channel?.id,
        createdBy: interaction.user.username,
        voters: new Set<string>(),
    } as Poll;
}
