import os
import discord

from discord.ext import commands as discord_commands
from discord_slash import SlashCommand

from malbot.common.commands import CommonCommands
from malbot.database.database import Database
from malbot.game_server.commands import GameServerCommands
from malbot.game_server.info_panel import InfoPanel
from malbot.game_server.rcon import RCON


class App(discord.Client):
    def __init__(self, *args, **kwargs):
        print('Starting bot...')

        super().__init__(*args, **kwargs)

        # Init database
        self.database = Database()

        # Set up client
        intents = discord.Intents.all()
        self.client = discord_commands.Bot(command_prefix='!', intents=intents)

        # Set up game server tools
        self.rcon_client = RCON(api=os.environ['API_ENDPOINT'])
        self.info_panel = InfoPanel()
        self.loop.create_task(self.init_info_panel())

        # Init slash commands
        self.command = SlashCommand(client=self.client, sync_commands=True)
        self.init_commands()

        # Start background tasks
        self.task = self.loop.create_task(self.info_panel.start_monitoring(client=self.client))

    async def on_ready(self):
        await self.change_presence(
            activity=discord.Activity(type=discord.ActivityType.watching, name='Bottom Gear')
        )

        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('---------------')

    async def init_info_panel(self):
        print('Initialising info panel...')

        await self.info_panel.fetch_data(db=self.database, rcon_client=self.rcon_client)

    def init_commands(self):
        print('Initialising user commands...')

        CommonCommands(
            client=self.client.user,
            command=self.command
        ).init()
        GameServerCommands(
            client=self.client,
            command=self.command,
            rcon_client=self.rcon_client,
            info_panel=self.info_panel
        ).init()
