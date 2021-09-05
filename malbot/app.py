import os
import discord

from discord.ext import commands as discord_commands
from discord_slash import SlashCommand

from malbot.common.commands import CommonCommands
from malbot.database.database import Database
from malbot.game_server.commands import GameServerCommands
from malbot.game_server.info_panel import InfoPanel
from malbot.game_server.rcon import RCON


def run():
    print('Starting...')

    # Connect to database
    database = Database()
    database.connect()

    # Set up client
    intents = discord.Intents.all()
    client = discord_commands.Bot(command_prefix='!', intents=intents)

    # Set up game server tools
    rcon_client = RCON(api=os.environ['API_ENDPOINT'])
    info_panel_builder = InfoPanel()

    # Init slash commands
    command = SlashCommand(client, sync_commands=True)
    CommonCommands(
        client=client,
        command=command
    ).init()
    GameServerCommands(
        client=client,
        command=command,
        rcon_client=rcon_client,
        info_panel_builder=info_panel_builder
    ).init()

    @client.event
    async def on_ready():
        await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name='Bottom Gear'))

        print('Logged in as {0.user}'.format(client))

    client.run(os.environ['DISCORD_TOKEN'])
