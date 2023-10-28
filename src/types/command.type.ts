import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type Command = {
    data:
        | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
        | SlashCommandSubcommandsOnlyBuilder;

    run: (
        client: Client,
        interaction: ChatInputCommandInteraction
    ) => Promise<void>;
};
