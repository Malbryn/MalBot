import os

from discord import Client, Member
from discord_slash import SlashCommand
from discord_slash.model import SlashCommandPermissionType
from discord_slash.utils.manage_commands import create_permission, create_option

from malbot.commands.commands import Commands

GUILD_ID = int(os.environ['GUILD_ID'])
ROLE_ID_EVERYONE = int(os.environ['ROLE_ID_EVERYONE'])
ROLE_ID_ADMIN = int(os.environ['ROLE_ID_ADMIN'])
ROLE_ID_BARRED = int(os.environ['ROLE_ID_BARRED'])


class AdminCommands(Commands):
    def __init__(self, client: Client, command: SlashCommand):
        super().__init__(name='Admin', client=client, command=command)

    def init(self) -> None:
        """Initialises the Admin commands."""
        @self.command.slash(
            name='bar',
            description='Bars a user [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            },
            options=[
                create_option(
                    name='user',
                    description='Tag a user to bar',
                    option_type=6,
                    required=True
                )
            ]
        )
        async def bar(context, user: Member) -> None:
            await context.send(f'{user.display_name} has been barred')
            await user.add_roles(context.guild.get_role(ROLE_ID_BARRED))
            await user.edit(mute=True)

        @self.command.slash(
            name='unbar',
            description='Unbars a user [Admin only]',
            guild_ids=[GUILD_ID],
            permissions={
                GUILD_ID: [
                    create_permission(ROLE_ID_EVERYONE, SlashCommandPermissionType.ROLE, False),
                    create_permission(ROLE_ID_ADMIN, SlashCommandPermissionType.ROLE, True)
                ]
            },
            options=[
                create_option(
                    name='user',
                    description='Tag a user to unbar',
                    option_type=6,
                    required=True
                )
            ]
        )
        async def unbar(context, user: Member) -> None:
            await context.send(f'{user.display_name} has been unbarred')
            await user.remove_roles(context.guild.get_role(ROLE_ID_BARRED))
            await user.edit(mute=False)
