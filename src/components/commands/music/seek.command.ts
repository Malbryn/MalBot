import { SlashCommandIntegerOption } from '@discordjs/builders';
import { GuildQueue, Player, useMainPlayer } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import { config } from '../../../config/config';
import { logger } from '../../../index';

export class SeekCommand extends Command {
    static readonly NAME: string = 'seek';
    private static instance: SeekCommand;

    private constructor() {
        super();
    }

    public static getInstance(): SeekCommand {
        if (!SeekCommand.instance) {
            SeekCommand.instance = new SeekCommand();
        }

        return SeekCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(SeekCommand.NAME)
            .setDescription('Seeks to the given time.')
            .addIntegerOption((option: SlashCommandIntegerOption) =>
                option
                    .setName('time')
                    .setDescription('Time in seconds')
                    .setRequired(true),
            );
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const player: Player = useMainPlayer();
        const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

        if (!queue) {
            return await this.handleError(interaction, 'Player queue is empty');
        }

        const seekTime: number | null = interaction.options.getInteger('time');

        if (!seekTime) {
            return await this.handleError(interaction, 'Seek time is missing');
        }

        logger.debug(`Seeking [Time: ${seekTime}s]`);

        try {
            await queue.node.seek(seekTime * 1000);
            await this.sendReply(
                interaction,
                `⏩ Skipped to ${seekTime} seconds`,
            );
        } catch (error) {
            logger.warn('Problem', (error as Error)?.message);
        }
    }
}
