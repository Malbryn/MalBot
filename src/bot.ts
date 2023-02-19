export {};

import * as config from '../config.json';
import { Client } from 'discord.js';
import { exit } from 'process';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';

const DISCORD_TOKEN: string | undefined = config.discordToken;

if (!DISCORD_TOKEN) {
    console.log('Discord token is not found');
    exit(1);
}

console.log('Bot is starting...');

const client = new Client({
    intents: [],
});

ready(client);
interactionCreate(client);

client.login(DISCORD_TOKEN);
