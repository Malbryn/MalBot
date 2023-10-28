import { Command } from '../../types/command.type';
import {
    AnyComponentBuilder,
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { ActionRowBuilder } from '@discordjs/builders';
import { logger, pollService } from '../../main';
import { PollOption } from '../../types/poll-option.type';

export const VoteCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Lets the user cast a vote in a running poll.'),
    async run(
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        if (pollService.poll) {
            const options: Map<number, PollOption> = pollService.poll.options;
            const selectMenu: StringSelectMenuBuilder =
                new StringSelectMenuBuilder()
                    .setCustomId('VoteSelectMenu')
                    .setPlaceholder('Select')
                    .setMinValues(1)
                    .setMaxValues(
                        pollService.poll.allowMultiple ? options.size : 1
                    );

            for (const [index, option] of options) {
                const indexString: string = String(index);
                const label: string = option.name;

                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(label)
                        .setValue(indexString)
                );
            }

            const actionRow: ActionRowBuilder<AnyComponentBuilder> =
                new ActionRowBuilder().addComponents(selectMenu);
            const content: string = pollService.poll.allowMultiple
                ? 'Select multiple'
                : 'Select one';

            await interaction.reply({
                content,
                // @ts-ignore
                components: [actionRow],
            });
        } else {
            logger.warn('There is no poll in progress');

            await interaction.reply({
                content: 'There is no poll in progress',
            });
        }
    },
};
