import os

from discord.ext.commands import Bot
from discord_slash import SlashCommand
from discord_slash.model import SlashCommandPermissionType
from discord_slash.utils.manage_commands import create_permission

from malbot.commands.commands import Commands

GUILD_ID = int(os.environ['GUILD_ID'])
ROLE_ID_EVERYONE = int(os.environ['ROLE_ID_EVERYONE'])
ROLE_ID_ADMIN = int(os.environ['ROLE_ID_ADMIN'])


class CommonCommands(Commands):
    def __init__(self, client: Bot, command: SlashCommand):
        super().__init__(name='Common', client=client, command=command)

    def init(self) -> None:
        """Initialises the Common commands."""
        @self.command.slash(
            name='ping',
            description='Show the latency of the bot [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def ping(context):
            print('PING')
            await context.send(f'Latency: {round(self.client.latency * 1000)}ms')

        @self.command.slash(
            name='help2',
            description='Show a list of the available commands [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def help(context):
            await context.send('NOT YET IMPLEMENTED')  # TODO: Implement this
