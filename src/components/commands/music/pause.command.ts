import { GuildQueue, Player, useMainPlayer } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../../globals';
import { ConfigService } from '../../../services';
import { Command } from '../command';

export class PauseCommand extends Command {
    static readonly NAME: string = 'pause';

    private static _instance: PauseCommand;

    private _configService: ConfigService = ConfigService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): PauseCommand {
        if (!PauseCommand._instance) {
            PauseCommand._instance = new PauseCommand();
        }

        return PauseCommand._instance;
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

        logger.debug('Pausing player');

        queue.node.pause();
        await this.sendSimpleReply(interaction, '⏸️ Paused player');
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(PauseCommand.NAME)
            .setDescription('Pauses the currently played song.');
    }
}
