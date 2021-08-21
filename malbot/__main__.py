import os
import discord

from discord.ext import commands
from discord_slash import SlashCommand
from discord_slash.utils.manage_commands import create_option

from malbot.log import init_logger
from malbot.steam_api.rcon_commands import RCON

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
        name='ping',
        description='Show the latency of the bot',
        guild_ids=guild_id
    )
    async def ping(context):
        await context.send(f'Latency: {round(client.latency * 1000)}ms')

    @slash.slash(
        name='player_list',
        description='Get the number of online players on the DayZ server',
        guild_ids=guild_id
    )
    async def player_list(context):
        await rcon_client.get_player_list(context)
        
    @slash.slash(
        name='send_global_message',
        description='Send global message to the server',
        guild_ids=guild_id,
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

    client.run(os.environ['DISCORD_TOKEN'])


if __name__ == '__main__':
    main()
