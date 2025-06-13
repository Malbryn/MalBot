import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { embedColours } from '../../../globals';
import { ServerMonitoringService } from '../../../services';
import { Command } from '../command';

export class StopServerMonitoringCommand extends Command {
    static readonly NAME: string = 'stop_server_monitoring';

    private static instance: StopServerMonitoringCommand;

    private _serverMonitoringService: ServerMonitoringService =
        ServerMonitoringService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): StopServerMonitoringCommand {
        if (!StopServerMonitoringCommand.instance) {
            StopServerMonitoringCommand.instance =
                new StopServerMonitoringCommand();
        }

        return StopServerMonitoringCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(StopServerMonitoringCommand.NAME)
            .setDescription('Stops the game server monitoring.')
            .setDefaultMemberPermissions(1 << 3);
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        if (!this._serverMonitoringService.isRunning()) {
            return await this.sendSimpleReply(
                interaction,
                '⚠️ Server monitoring is not running',
                embedColours.WARNING,
            );
        }

        await this._serverMonitoringService.stop();
        await this.sendSimpleReply(
            interaction,
            '📡 Server monitoring has been stopped',
        );
    }
}
