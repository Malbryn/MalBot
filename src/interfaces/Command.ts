import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface Command {
    data:
        | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
        | SlashCommandSubcommandsOnlyBuilder;
    run: (
        client: Client,
        interaction: ChatInputCommandInteraction
    ) => Promise<void>;
}
