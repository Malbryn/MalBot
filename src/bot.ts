export {};

import { Client } from 'discord.js';
import { exit } from 'process';
import { Logger } from 'tslog';
import * as config from '../config.json';
import interactionCreate from './listeners/interactionCreate';
import ready from './listeners/ready';

const logger = new Logger(config.loggerConfig);

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
