import { GuildQueue, Player, useMainPlayer } from 'discord-player';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import { config } from '../../../config/config';

export class StopCommand extends Command {
    static readonly NAME: string = 'stop';
    private static instance: StopCommand;

    private constructor() {
        super();
    }

    public static getInstance(): StopCommand {
        if (!StopCommand.instance) {
            StopCommand.instance = new StopCommand();
        }

        return StopCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(StopCommand.NAME)
            .setDescription(
                'Stops the player and kicks the bot from the voice channel.',
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

        queue.node.stop(true);
        queue.delete();
        await this.sendReply(interaction, '⏹️ Stopped player');
    }
}
