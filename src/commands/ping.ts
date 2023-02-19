import {
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from 'src/interfaces/Command';
import { ExtendedClient } from 'src/models/ExtendedClient';

export const Ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot and returns the latency.'),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const reply: Message<boolean> = await interaction.reply({
            content: 'Pong [Latency: ms]',
            fetchReply: true,
        });
        const latency: number =
            reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Pong [Latency: ${latency}ms]`);
    },
};
