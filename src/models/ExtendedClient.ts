import { Client } from 'discord.js';
import { Player } from 'discord-player';

export class ExtendedClient extends Client {
    player: Player | undefined;
}
