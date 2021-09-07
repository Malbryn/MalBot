import asyncio
import os

import discord
import valve.source.a2s
import time

from datetime import datetime

from malbot.database.database import Database
from malbot.game_server.rcon import RCON


class InfoPanel:
    def __init__(self):
        self.rcon_client = None

        self.name = '<unknown>'
        self.address = '<unknown>'
        self.password = '<unknown>'
        self.modset = '<unknown>'
        self.current_player_count = 999
        self.max_player_count = 999
        self.player_list = ''
        self.timestamp = ''

        self.guild_id = None
        self.channel_id = None
        self.message_id = None

        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        self.refresh_rate = 5  # Seconds

    async def fetch_data(self, db: Database, rcon_client: RCON) -> None:
        print('Fetching data from database...')

        try:
            db.connect()

            data = db.query('SELECT * FROM game_server WHERE id=1')

            self.rcon_client = rcon_client

            self.guild_id = int(data[1])
            self.channel_id = int(data[2])
            self.message_id = int(data[3])
            self.address = data[4]
            self.password = data[5]
            self.modset = data[6]

            print('Server info panel reattached using ID of {}'.format(self.message_id))

            await self.__build_embed(self)
        except Exception as e:
            print('Unable to fetch data from database: ', e)
        finally:
            db.disconnect()

    # TODO: update ID's to database
    async def create_embed(self, rcon_client, context, address, password, modset) -> None:
        if self.message_id:
            await context.channel.send('Info panel already exist, '
                                       'please delete the old one first using `/delete_server_info_panel` command',
                                       delete_after=5.0)
            return None

        self.rcon_client = rcon_client

        self.address = address
        self.password = password
        self.modset = modset

        await self.__build_embed(context=context)

        try:
            message = await context.channel.send(embed=self.embed)
            self.message_id = message.id
        except Exception as e:
            print('Creating server info embed failed: ', e)
            await context.channel.send(f'Creating server info embed failed: {e}', delete_after=5.0)

    # TODO: remove ID's from database?
    async def delete(self, context) -> None:
        if not self.message_id:
            print('Info panel does not exist')
            await context.channel.send('Info panel does not exist', delete_after=5.0)
            return None

        try:
            message = await context.channel.fetch_message(self.message_id)
            await message.delete()
        except Exception as e:
            print('Deleting info panel failed: ', e)
            await context.channel.send(f'Deleting info panel failed: {e}', delete_after=5.0)
            return None

        await self.stop_monitoring()

        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        self.message_id = ''
        self.player_list = ''

        await context.channel.send('Deleted info panel', delete_after=5.0)

    async def refresh(self, client) -> None:
        print('Refreshing server info panel...')

        if not self.message_id:
            print('Info panel does not exist')
            # await context.channel.send('Info panel does not exist', delete_after=5.0)
            return None

        await self.__build_embed(self)

        try:
            channel = client.get_channel(self.channel_id)

            if not channel:
                raise Exception('Channel is not found')

            message = channel.fetch_message(self.message_id)

            if not message:
                raise Exception('Message is not found')

            await message.edit(embed=self.embed)
        except Exception as e:
            print('Failed to fetch channel/message: ', e)
            return None

    async def start_monitoring(self, client) -> None:
        print('Starting game server monitoring...')

        await client.wait_until_ready()
        while not client.is_closed():
            # await self.refresh(client=client)
            # await asyncio.sleep(self.refresh_rate)
            print('*** TEST ***')
            await asyncio.sleep(5)

    async def stop_monitoring(self) -> None:
        print('Stopping game server monitoring...')

    async def __reattach(self) -> None:
        print('Attempting to reattach to server info panel...')

        if not (self.guild_id and self.channel_id and self.message_id):
            print('Cannot reattach to server info panel with the following ID\'s:')
            print('GUILD_ID = {}, CHANNEL_ID = {}, MESSAGE_ID = {}'
                  .format(self.guild_id, self.channel_id, self.message_id))
            return

        await self.__build_embed(self)

        print('Server info panel reattached using message ID of {}'.format(self.message_id))

    async def __build_embed(self, context) -> None:
        print('Building embed for the server info panel...')

        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        await self.__init_details(context=context)
        await self.__init_modset(context=context)
        await self.__init_player_count(context=context)
        await self.__init_player_list(context=context)
        await self.__init_footer(context=context)

        print('Finished building embed')

    async def __init_details(self, context):
        with valve.source.a2s.ServerQuerier((os.environ['RCON_IP'], int(os.environ['QUERY_PORT']))) as server:
            self.name = server.info().values['server_name']

        try:
            self.embed.add_field(
                name='Details',
                value='```\nServer name: {}\nAddress: {}\nPassword: {}```'.format(
                    self.name, self.address, self.password
                ),
                inline=False
            )
        except Exception as e:
            print('Creating Details field failed: ', e)
            await context.channel.send('Creating Details field failed: ', e)

    async def __init_player_count(self, context):
        try:
            with valve.source.a2s.ServerQuerier((os.environ['RCON_IP'], int(os.environ['QUERY_PORT']))) as server:
                self.max_player_count = server.info().values['max_players']
                self.current_player_count = server.info().values['player_count']

            self.embed.add_field(
                name='Player count',
                value='```\n{}/{}```'.format(self.current_player_count, self.max_player_count),
                inline=False
            )
        except Exception as e:
            print('Creating Player count field failed: ', e)
            await context.channel.send('Creating Player field count failed: ', e)

    async def __init_modset(self, context):
        try:
            self.embed.add_field(
                name='Modset',
                value='{}'.format(self.modset),
                inline=False
            )
        except Exception as e:
            print('Creating Modset field failed: ', e)
            await context.channel.send('Creating Modset field failed: ', e)

    async def __init_player_list(self, context):
        try:
            self.player_list = ''

            players = await self.rcon_client.get_players()

            with valve.source.a2s.ServerQuerier((os.environ['RCON_IP'], int(os.environ['QUERY_PORT']))) as server:
                all_players = server.players().values['players']

            for i in range(len(players), 0, -1):
                players[i-1].duration = \
                    time.strftime('%H:%M:%S', time.gmtime(all_players[len(players) - i].values['duration']))

                info = '{:>2} | {:>16} | {:>3} ms | {:>8}\n'.format(
                    players[i-1].rcon_id, players[i-1].name, players[i-1].ping, players[i-1].duration
                )
                self.player_list += info

            self.embed.add_field(
                name='Player list',
                value='```\nID |             Name |   Ping | Duration'
                      '\n-----------------------------------------\n{}```'.format(self.player_list),
                inline=False
            )
        except Exception as e:
            print('Creating Player list field failed: ', e)
            await context.channel.send('Creating Player list field failed: ', e)

    async def __init_footer(self, context):
        try:
            self.timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            self.embed.set_footer(
                text='Last updated: {}'.format(self.timestamp),
                icon_url='https://probot.media/tUE1WGMdwV.png'
            )
        except Exception as e:
            print('Creating Timestamp failed: ', e)
            await context.channel.send('Creating Timestamp field failed: ', e)
