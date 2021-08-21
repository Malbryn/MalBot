import os
import discord

from discord.ext import commands
from discord_slash import SlashCommand
from malbot.log import init_logger
from malbot.steam_api.server_info import RCON

API_ENDPOINT = 'https://beguid-converter.allianceapps.io/v3'


def main():
    # Set up logger
    logger = init_logger()

    # Set up client
    intents = discord.Intents.all()
    client = commands.Bot(command_prefix='!', intents=intents)
    slash = SlashCommand(client, sync_commands=True)
    guild_id = [int(os.environ['DISCORD_GUILD_ID'])]

    # Set up RCON
    rcon_client = RCON(api=API_ENDPOINT)

    @client.event
    async def on_ready():
        print('Logged in as {0.user}'.format(client))
        logger.info('Clarkson is alive')

    @slash.slash(
        name='Ping',
        description='Show the latency of the bot',
        guild_ids=guild_id
    )
    async def ping(ctx):
        await ctx.send(f'Latency: {round(client.latency * 1000)}ms')

    @slash.slash(
        name='PlayerList',
        description='Get the number of online players on the DayZ server',
        guild_ids=guild_id
    )
    async def player_list(ctx):
        await ctx.send(f'Online players: {await rcon_client.get_player_list()}')

    client.run(os.environ['DISCORD_TOKEN'])


if __name__ == '__main__':
    main()
