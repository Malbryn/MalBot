import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from 'src/interfaces/Command';

export const ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot and replies with the latency.'),
    async run(interaction: CommandInteraction) {
        const reply = await interaction.reply({
            content: 'Pong [Latency: ms]',
            fetchReply: true,
        });
        const latency = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Pong [Latency: ${latency}ms]`);
    },
};
