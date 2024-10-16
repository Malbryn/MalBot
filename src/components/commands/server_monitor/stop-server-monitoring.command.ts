import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import { ServerMonitoringService } from '../../../services/server-monitoring.service';
import { embedColours } from '../../../config/config';

export class StopServerMonitoringCommand extends Command {
    static readonly NAME: string = 'stop_server_monitoring';
    private static instance: StopServerMonitoringCommand;

    private serverMonitoringService: ServerMonitoringService =
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
            .setDescription('Stops the game server monitoring.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        if (!this.serverMonitoringService.isRunning()) {
            return await this.sendSimpleReply(
                interaction,
                '⚠️ Server monitoring is not running',
                embedColours.WARNING,
            );
        }

        await this.serverMonitoringService.stop();
        await this.sendSimpleReply(
            interaction,
            '📡 Server monitoring has been stopped',
        );
    }
}
