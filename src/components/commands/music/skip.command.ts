import { GuildQueue, Player, Track, useMainPlayer } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../../globals';
import { ConfigService } from '../../../services';
import { Command } from '../command';

export class SkipCommand extends Command {
    static readonly NAME: string = 'skip';

    private static instance: SkipCommand;

    private _configService: ConfigService = ConfigService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): SkipCommand {
        if (!SkipCommand.instance) {
            SkipCommand.instance = new SkipCommand();
        }

        return SkipCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(SkipCommand.NAME)
            .setDescription('Skips the current song.');
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

        const currentSong: Track | null = queue.currentTrack;

        logger.debug(
            `Skipping current song [Title: ${currentSong?.title ?? ''}]`,
        );

        queue.node.skip();
        await this.sendSimpleReply(
            interaction,
            `⏭️ Skipped ${currentSong?.title ?? ''}`,
        );
    }
}
