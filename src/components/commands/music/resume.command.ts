import { GuildQueue, Player, useMainPlayer } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../../globals';
import { ConfigService } from '../../../services';
import { Command } from '../command';

export class ResumeCommand extends Command {
    static readonly NAME: string = 'resume';

    private static instance: ResumeCommand;

    private _configService: ConfigService = ConfigService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): ResumeCommand {
        if (!ResumeCommand.instance) {
            ResumeCommand.instance = new ResumeCommand();
        }

        return ResumeCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(ResumeCommand.NAME)
            .setDescription('Resumes the current song.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const player: Player = useMainPlayer();
        const queue: GuildQueue | null = player.nodes.get(
            this._configService.get('client').guildId,
        );

        if (!queue) {
            return await this.handleError(interaction, 'Player queue is empty');
        }

        logger.debug('Resuming player');

        queue.node.resume();
        await this.sendSimpleReply(interaction, '▶️ Resumed player');
    }
}
