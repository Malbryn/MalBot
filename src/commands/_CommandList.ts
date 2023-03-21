import { Command } from '../interfaces/Command';
import { Ping } from './misc';
import { Pause, Play, Queue, Resume, Seek, Skip, Stop } from './music';
import { Create } from './server_info';

export const commandMap: Map<string, Command> = new Map<string, Command>();

// Music
commandMap.set(Play.data.name, Play);
commandMap.set(Pause.data.name, Pause);
commandMap.set(Resume.data.name, Resume);
commandMap.set(Skip.data.name, Skip);
commandMap.set(Queue.data.name, Queue);
commandMap.set(Stop.data.name, Stop);
commandMap.set(Seek.data.name, Seek);

// Misc
commandMap.set(Ping.data.name, Ping);

// Server info
commandMap.set(Create.data.name, Create);
