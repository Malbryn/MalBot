import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
} from 'discord.js';
import { embedColours, logger } from '../../../globals';
import { Command } from '../command';

export class PingCommand extends Command {
    static readonly NAME: string = 'ping';
    private static instance: PingCommand;

    private constructor() {
        super();
    }

    public static getInstance(): PingCommand {
        if (!PingCommand.instance) {
            PingCommand.instance = new PingCommand();
        }

        return PingCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(PingCommand.NAME)
            .setDescription('Pings the bot and returns the latency.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder.setColor(embedColours.INFO).setAuthor({
            name: '⏱️ Measuring latency...',
        });

        const reply: Message = await interaction.editReply({
            embeds: [embedBuilder],
        });
        const latency: number =
            reply.createdTimestamp - interaction.createdTimestamp;

        embedBuilder.setAuthor({
            name: `⏱️ Latency: ${latency}ms`,
        });
        await interaction.editReply({ embeds: [embedBuilder] });

        logger.debug(`Latency: ${latency}ms`);
    }
}
