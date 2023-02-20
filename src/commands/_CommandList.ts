import { Command } from '../interfaces/Command';
import { Play, Pause, Resume, Ping, Queue, Skip, Stop } from './';

export const commandMap: Map<string, Command> = new Map<string, Command>();

// Music
commandMap.set(Play.data.name, Play);
commandMap.set(Pause.data.name, Pause);
commandMap.set(Resume.data.name, Resume);
commandMap.set(Skip.data.name, Skip);
commandMap.set(Queue.data.name, Queue);
commandMap.set(Stop.data.name, Stop);

// Misc
commandMap.set(Ping.data.name, Ping);