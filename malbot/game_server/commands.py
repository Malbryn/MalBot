import os

from discord.ext.commands import Bot
from discord_slash import SlashCommand
from discord_slash.model import SlashCommandPermissionType
from discord_slash.utils.manage_commands import create_permission, create_option

from malbot.commands.commands import Commands
from malbot.game_server.info_panel import InfoPanel
from malbot.game_server.rcon import RCON

GUILD_ID = int(os.environ['GUILD_ID'])
ROLE_ID_EVERYONE = int(os.environ['ROLE_ID_EVERYONE'])
ROLE_ID_ADMIN = int(os.environ['ROLE_ID_ADMIN'])


class GameServerCommands(Commands):
    def __init__(self, client: Bot, command: SlashCommand, rcon_client: RCON, info_panel: InfoPanel):
        super().__init__(name='Game Server', client=client, command=command)
        self.rcon_client = rcon_client
        self.info_panel = info_panel

    def init(self) -> None:
        """Initialises the Game Server commands"""
        @self.command.slash(
            name='player_list',
            description='Get a list of the online players on the DayZ server [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def player_list(context) -> None:
            await self.rcon_client.get_player_list(context)

        @self.command.slash(
            name='send_global_message',
            description='Send global message to the server [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            },
            options=[
                create_option(
                    name='message',
                    description='The message to send',
                    option_type=3,
                    required=True
                )
            ]
        )
        async def send_global_message(context, message: str) -> None:
            await self.rcon_client.send_global_message(context=context, message=message)

        @self.command.slash(
            name='create_server_info_panel',
            description='Create a panel for the server info [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            },
            options=[
                create_option(
                    name='address',
                    description='IP and port of the server',
                    option_type=3,
                    required=True
                ),
                create_option(
                    name='password',
                    description='Password for the server',
                    option_type=3,
                    required=True
                ),
                create_option(
                    name='modset',
                    description='Link to the modset for the server',
                    option_type=3,
                    required=True
                )
            ]
        )
        async def create_server_info_panel(context, address: str, password: str, modset: str) -> None:
            await context.send('Creating server info panel...', delete_after=5.0)
            await self.info_panel.create(
                context=context, rcon_client=self.rcon_client, address=address, password=password, modset=modset
            )

        @self.command.slash(
            name='delete_server_info_panel',
            description='Delete the server info panel [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def delete_server_info_panel(context) -> None:
            await context.send('Deleting server info panel...', delete_after=5.0)
            await self.info_panel.delete(context=context)

        @self.command.slash(
            name='refresh_server_info_panel',
            description='Refresh the server info panel [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def refresh_server_info_panel(context) -> None:
            await context.send('Refreshing server info panel...', delete_after=5.0)
            await self.info_panel.refresh(context=context)

        @self.command.slash(
            name='start_server_info_panel',
            description='Start the server info panel, after creating or reattaching the info panel [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def start_server_info_panel(context):
            await context.send('Starting server info panel...', delete_after=5.0)
            await self.client.loop.create_task(self.info_panel.start_monitoring(context=context))

        @self.command.slash(
            name='stop_server_info_panel',
            description='Stop the server info panel [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def stop_server_info_panel(context):
            await context.send('Stopping server info panel...', delete_after=5.0)
            await self.info_panel.stop_monitoring()
