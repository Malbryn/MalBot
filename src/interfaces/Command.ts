import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { ExtendedClient } from '../models/ExtendedClient';

export interface Command {
    data:
        | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
        | SlashCommandSubcommandsOnlyBuilder;
    run: (
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) => Promise<void>;
}
