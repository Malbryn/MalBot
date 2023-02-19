import { Command } from '../interfaces/Command';
import { Ping } from './Ping';
import { Play } from './Play';

export const commandMap: Map<string, Command> = new Map<string, Command>();

commandMap.set(Ping.data.name, Ping);
commandMap.set(Play.data.name, Play);
