import os

from discord import Client
from discord_slash import SlashCommand
from discord_slash.model import SlashCommandPermissionType
from discord_slash.utils.manage_commands import create_permission, create_option

from malbot.commands.commands import Commands
from malbot.music.music import Music

GUILD_ID = int(os.environ['GUILD_ID'])
ROLE_ID_EVERYONE = int(os.environ['ROLE_ID_EVERYONE'])
ROLE_ID_ADMIN = int(os.environ['ROLE_ID_ADMIN'])


class MusicCommands(Commands):
    def __init__(self, client: Client, command: SlashCommand, music: Music):
        super().__init__(name='Music', client=client, command=command)

        self.music = music

    def init(self) -> None:
        """Initialises the Music commands."""
        @self.command.slash(
            name='play',
            description='Play a video from Youtube [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            },
            options=[
                create_option(
                    name='url',
                    description='URL of the Youtube video',
                    option_type=3,
                    required=True
                )
            ]
        )
        async def play(context, url: str) -> None:
            await context.send('Playing thing...')
            await self.music.play(context=context, url=url)

        @self.command.slash(
            name='pause',
            description='Pause the currently playing track [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def pause(context) -> None:
            await context.send('Pausing thing...')

        @self.command.slash(
            name='resume',
            description='Resume the currently playing track [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def resume(context) -> None:
            await context.send('Resuming thing...')

        @self.command.slash(
            name='stop',
            description='Stop the currently playing track [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def stop(context) -> None:
            await context.send('Stop thing...')

        @self.command.slash(
            name='join',
            description='Join the voice channel [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def join(context) -> None:
            await context.send('Joining...')

        @self.command.slash(
            name='leave',
            description='Leave the voice channel [All]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, True),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            }
        )
        async def leave(context) -> None:
            await context.send('Leaving...')
