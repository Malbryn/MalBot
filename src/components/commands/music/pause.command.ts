import { GuildQueue, Player, useMainPlayer } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import { config } from '../../../config/config';
import { logger } from '../../../index';

export class PauseCommand extends Command {
    static readonly NAME: string = 'pause';
    private static instance: PauseCommand;

    private constructor() {
        super();
    }

    public static getInstance(): PauseCommand {
        if (!PauseCommand.instance) {
            PauseCommand.instance = new PauseCommand();
        }

        return PauseCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(PauseCommand.NAME)
            .setDescription('Pauses the currently played song.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const player: Player = useMainPlayer();
        const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

        if (!queue) {
            return await this.handleError(interaction, 'Player queue is empty');
        }

        logger.debug('Pausing player');

        queue.node.pause();
        await this.sendReply(interaction, '⏸️ Paused player');
    }
}
