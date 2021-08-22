import os
import discord

from discord.ext import commands
from discord_slash import SlashCommand
from discord_slash.model import SlashCommandPermissionType
from discord_slash.utils.manage_commands import create_option, create_permission

from malbot.game_server.info_panel import InfoPanel
from malbot.log import init_logger
from malbot.game_server.rcon import RCON

GUILD_ID = int(os.environ['GUILD_ID'])
ROLE_EVERYONE_ID = int(os.environ['ROLE_EVERYONE_ID'])
ROLE_ADMIN_ID = int(os.environ['ROLE_ADMIN_ID'])


def main():
    # Set up logger
    logger = init_logger()

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

    @slash.slash(
        name='ping',
        description='Show the latency of the bot [All]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, True),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        }
    )
    async def ping(context):
        await context.send(f'Latency: {round(client.latency * 1000)}ms')

    @slash.slash(
        name='player_list',
        description='Get a list of the online players on the DayZ server [All]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, True),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        }
    )
    async def player_list(context):
        await rcon_client.get_player_list(context)
        
    @slash.slash(
        name='send_global_message',
        description='Send global message to the server [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
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
    async def send_global_message(context, message: str):
        await rcon_client.send_global_message(context=context, message=message)

    @slash.slash(
        name='create_server_info_panel',
        description='Create a panel for the server info [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
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
    async def create_server_info_panel(context, address: str, password: str, modset: str):
        await context.send('Creating server info panel...', delete_after=5.0)
        await info_panel_builder.create_server_info_panel(
            context=context, rcon_client=rcon_client, address=address, password=password, modset=modset
        )

    @slash.slash(
        name='delete_server_info_panel',
        description='Delete the server info panel [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        }
    )
    async def delete_server_info_panel(context):
        await context.send('Deleting server info panel...', delete_after=5.0)
        await info_panel_builder.delete_server_info_panel(context=context)

    @slash.slash(
        name='refresh_server_info_panel',
        description='Refresh the server info panel [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        }
    )
    async def refresh_server_info_panel(context):
        await context.send('Refreshing server info panel...', delete_after=5.0)
        await info_panel_builder.refresh_server_info_panel(context=context)

    @slash.slash(
        name='reattach_server_info_panel',
        description='Reattach the server info panel to the bot (if the bot was offline) [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        },
        options=[
            create_option(
                name='message_id',
                description='Message ID (right click > Copy ID)',
                option_type=3,
                required=True
            ),
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
    async def reattach_server_info_panel(context, message_id: int, address: str, password: str, modset: str):
        await context.send('Reattaching server info panel...', delete_after=5.0)
        await info_panel_builder.reattach_server_info_panel(
            context=context, rcon_client=rcon_client, message_id=message_id,
            address=address, password=password, modset=modset
        )

    @slash.slash(
        name='start_server_info_panel',
        description='Start the server info panel, after creating or reattaching the info panel [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        }
    )
    async def start_server_info_panel(context):
        await context.send('Starting server info panel...', delete_after=5.0)
        await client.loop.create_task(info_panel_builder.start_server_info_panel(context=context))

    @slash.slash(
        name='stop_server_info_panel',
        description='Stop the server info panel [Admin only]',
        guild_ids=[GUILD_ID],
        permissions={
            GUILD_ID: [
                create_permission(ROLE_EVERYONE_ID, SlashCommandPermissionType.ROLE, False),
                create_permission(ROLE_ADMIN_ID, SlashCommandPermissionType.ROLE, True)
            ]
        }
    )
    async def stop_server_info_panel(context):
        await context.send('Stopping server info panel...', delete_after=5.0)
        await info_panel_builder.stop_server_info_panel(context=context)

    client.run(os.environ['DISCORD_TOKEN'])


if __name__ == '__main__':
    main()
