import os
import discord

from discord.ext import commands as discord_commands
from discord_slash import SlashCommand

from malbot.admin.commands import AdminCommands
from malbot.common.commands import CommonCommands
from malbot.database.database import Database
from malbot.game_server.commands import GameServerCommands
from malbot.game_server.info_panel import InfoPanel
from malbot.game_server.rcon import RCON


class App(discord.Client):
    def __init__(self, *args, **kwargs):
        print('Starting bot...')

        super().__init__(*args, **kwargs)

        # Set up client
        intents = discord.Intents.all()
        self.client = discord_commands.Bot(command_prefix='!', intents=intents)

        # Init database
        self.database = Database()

        # Set up game server tools
        self.rcon_client = RCON(api=os.environ['API_ENDPOINT'])
        self.info_panel = InfoPanel(database=self.database, rcon_client=self.rcon_client)

        # Init slash commands
        self.command = SlashCommand(client=self, sync_commands=True)
        self.init_commands()

        # Background tasks
        self.loop.create_task(self.init_info_panel())

    async def on_ready(self):
        await self.change_presence(
            activity=discord.Activity(type=discord.ActivityType.watching, name='Bottom Gear')
        )

        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('---------------')

    async def init_info_panel(self):
        print('Initialising info panel...')

        await self.info_panel.fetch_data()

        if self.info_panel.message_id:
            await self.loop.create_task(self.info_panel.start_monitoring(client=self))

    def init_commands(self):
        print('Initialising user commands...')

        AdminCommands(
            client=self,
            command=self.command
        ).init()
        CommonCommands(
            client=self,
            command=self.command
        ).init()
        GameServerCommands(
            client=self,
            command=self.command,
            rcon_client=self.rcon_client,
            info_panel=self.info_panel
        ).init()
