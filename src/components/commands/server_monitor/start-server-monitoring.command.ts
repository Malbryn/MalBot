import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';
import { ServerMonitoringService } from '../../../services/server-monitoring.service';
import { embedColours } from '../../../config/config';

export class StartServerMonitoringCommand extends Command {
    static readonly NAME: string = 'start_server_monitoring';
    private static instance: StartServerMonitoringCommand;

    private serverMonitoringService: ServerMonitoringService =
        ServerMonitoringService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): StartServerMonitoringCommand {
        if (!StartServerMonitoringCommand.instance) {
            StartServerMonitoringCommand.instance =
                new StartServerMonitoringCommand();
        }

        return StartServerMonitoringCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(StartServerMonitoringCommand.NAME)
            .setDescription('Starts the game server monitoring.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        if (this.serverMonitoringService.isRunning()) {
            return await this.sendReply(
                interaction,
                '⚠️ Server monitoring is already running',
                embedColours.WARNING,
            );
        }

        await this.serverMonitoringService.start();
        await this.sendReply(
            interaction,
            '📡 Server monitoring has been started',
        );
    }
}
