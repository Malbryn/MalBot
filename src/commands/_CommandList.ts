import { Command } from '../interfaces/Command';
import { PingCommand } from './misc';
import {
    PauseCommand,
    PlayCommand,
    QueueCommand,
    ResumeCommand,
    SeekCommand,
    SkipCommand,
    StopCommand,
} from './music';
import {
    CreateServerCommand,
    StartServerMonitoringCommand,
    StopServerMonitoringCommand,
} from './server_info';
import {
    CreateMultiSelectPollCommand,
    CreateSingleSelectPollCommand,
    EndPollCommand,
    VoteCommand,
} from './poll';

export const commandMap: Map<string, Command> = new Map<string, Command>();

// Music
commandMap.set(PlayCommand.data.name, PlayCommand);
commandMap.set(PauseCommand.data.name, PauseCommand);
commandMap.set(ResumeCommand.data.name, ResumeCommand);
commandMap.set(SkipCommand.data.name, SkipCommand);
commandMap.set(QueueCommand.data.name, QueueCommand);
commandMap.set(StopCommand.data.name, StopCommand);
commandMap.set(SeekCommand.data.name, SeekCommand);

// Misc
commandMap.set(PingCommand.data.name, PingCommand);

// Server info
commandMap.set(CreateServerCommand.data.name, CreateServerCommand);
commandMap.set(
    StartServerMonitoringCommand.data.name,
    StartServerMonitoringCommand
);
commandMap.set(
    StopServerMonitoringCommand.data.name,
    StopServerMonitoringCommand
);

// Poll
commandMap.set(
    CreateSingleSelectPollCommand.data.name,
    CreateSingleSelectPollCommand
);
commandMap.set(
    CreateMultiSelectPollCommand.data.name,
    CreateMultiSelectPollCommand
);
commandMap.set(EndPollCommand.data.name, EndPollCommand);
commandMap.set(VoteCommand.data.name, VoteCommand);
