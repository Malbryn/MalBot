export {};

import * as config from '../config.json';
import { Client } from 'discord.js';
import { exit } from 'process';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import { Logger } from 'tslog';

const logger = new Logger();

const DISCORD_TOKEN: string | undefined = config.discordToken;

if (!DISCORD_TOKEN) {
    logger.error('Discord token is not found!');
    exit(1);
}

logger.info('Bot is starting...');

const client = new Client({
    intents: [],
});

ready(client);
interactionCreate(client);

client.login(DISCORD_TOKEN);
