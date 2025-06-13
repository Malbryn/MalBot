import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { embedColours } from '../../../globals';
import { ServerMonitoringService } from '../../../services';
import { Command } from '../command';

export class StartServerMonitoringCommand extends Command {
    static readonly NAME: string = 'start_server_monitoring';

    private static instance: StartServerMonitoringCommand;

    private _serverMonitoringService: ServerMonitoringService =
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
            .setDescription('Starts the game server monitoring.')
            .setDefaultMemberPermissions(1 << 3);
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        if (this._serverMonitoringService.isRunning()) {
            return await this.sendSimpleReply(
                interaction,
                '⚠️ Server monitoring is already running',
                embedColours.WARNING,
            );
        }

        await this._serverMonitoringService.start();
        await this.sendSimpleReply(
            interaction,
            '📡 Server monitoring has been started',
        );
    }
}
