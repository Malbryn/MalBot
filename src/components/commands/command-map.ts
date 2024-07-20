import {
    PauseCommand,
    PlayCommand,
    QueueCommand,
    ResumeCommand,
    SeekCommand,
    SkipCommand,
    StopCommand,
} from './music';
import { Command } from './command';
import { PingCommand } from './misc';
import {
    CreateServerMonitorCommand,
    StartServerMonitoringCommand,
    StopServerMonitoringCommand,
} from './server_monitor';

export const COMMAND_MAP: Map<string, Command> = new Map()
    //Misc
    .set(PingCommand.NAME, PingCommand.getInstance())

    // Music
    .set(PlayCommand.NAME, PlayCommand.getInstance())
    .set(PauseCommand.NAME, PauseCommand.getInstance())
    .set(QueueCommand.NAME, QueueCommand.getInstance())
    .set(ResumeCommand.NAME, ResumeCommand.getInstance())
    .set(SeekCommand.NAME, SeekCommand.getInstance())
    .set(SkipCommand.NAME, SkipCommand.getInstance())
    .set(StopCommand.NAME, StopCommand.getInstance())

    // Server monitoring
    .set(
        CreateServerMonitorCommand.NAME,
        CreateServerMonitorCommand.getInstance(),
    )
    .set(
        StartServerMonitoringCommand.NAME,
        StartServerMonitoringCommand.getInstance(),
    )
    .set(
        StopServerMonitoringCommand.NAME,
        StopServerMonitoringCommand.getInstance(),
    );
