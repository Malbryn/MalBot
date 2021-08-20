import logging
import os

import discord
from discord.ext import commands
from discord_slash import SlashCommand


def main():
    # Set up logger
    logger = logging.getLogger('discord')
    logger.setLevel(logging.INFO)
    handler = logging.FileHandler(filename='./logs/discord.log', encoding='utf-8', mode='w')
    handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
    logger.addHandler(handler)

    # Set up client
    intents = discord.Intents.all()
    client = commands.Bot(command_prefix='!', intents=intents)
    slash = SlashCommand(client, sync_commands=True)
    guild_id = [int(os.environ['DISCORD_GUILD_ID'])]

    @client.event
    async def on_ready():
        print('Logged in as {0.user}'.format(client))
        logger.info('Clarkson is listening')

    @client.command()
    async def ping(ctx):
        """Checks for a response from the bot to see if it's alive."""
        await ctx.send('Pong')

    @slash.slash(name='Ping', description='Show the latency of the bot', guild_ids=guild_id)
    async def ping(ctx):
        await ctx.send(f'Latency: {round(client.latency * 1000)}ms')

    client.run(os.environ['DISCORD_TOKEN'])


if __name__ == '__main__':
    main()
