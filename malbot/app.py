import os
import discord

from discord.ext import commands
from discord_slash import SlashCommand
from discord_slash.model import SlashCommandPermissionType
from discord_slash.utils.manage_commands import create_option, create_permission

from malbot.game_server.info_panel import InfoPanel
from malbot.log import logger
from malbot.game_server.rcon import RCON

GUILD_ID = int(os.environ['GUILD_ID'])
ROLE_EVERYONE_ID = int(os.environ['ROLE_EVERYONE_ID'])
ROLE_ADMIN_ID = int(os.environ['ROLE_ADMIN_ID'])


def run():
    # Set up logger
    log = logger.init()

    # Set up client
    intents = discord.Intents.all()
    client = commands.Bot(command_prefix='!', intents=intents)
    slash = SlashCommand(client, sync_commands=True)

    # Set up game server tools
    rcon_client = RCON(api=os.environ['API_ENDPOINT'])
    info_panel_builder = InfoPanel()

    @client.event
    async def on_ready():
        await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name='Bottom Gear'))

        print('Logged in as {0.user}'.format(client))
        logger.info('Clarkson is alive')

    client.run(os.environ['DISCORD_TOKEN'])
