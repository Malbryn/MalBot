import asyncio
import os

import discord
import valve.source.a2s
import time

from datetime import datetime

from discord import Client
from discord.ext.commands import Context

from malbot.database.database import Database
from malbot.game_server.rcon import RCON


class InfoPanel:
    def __init__(self, database: Database, rcon_client: RCON):
        self.database = database
        self.rcon_client = rcon_client

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

        self.refresh_rate = 120  # Seconds
        self.cancel_task = False

    async def fetch_data(self) -> None:
        print('Fetching data from database...')

        try:
            await self.database.connect()

            data = await self.database.query('SELECT * FROM game_server FETCH FIRST ROW ONLY')

            print(data)
            if not data:
                raise Exception("The 'game_server' table doesn't contain any data")

            self.guild_id = int(data[1])
            self.channel_id = int(data[2])
            self.message_id = int(data[3])
            self.address = data[4]
            self.password = data[5]
            self.modset = data[6]

            print('Server info panel reattached using ID of {}'.format(self.message_id))

            await self.__build_embed()
        except Exception as e:
            print('Unable to fetch data from database: ', e)
        finally:
            await self.database.disconnect()

    async def create_embed(self, context: Context, address: str, password: str, modset: str) -> None:
        if self.message_id:
            await context.channel.send('Info panel already exist, '
                                       'please delete the old one first using `/delete_server_info_panel` command',
                                       delete_after=5.0)
            return None

        self.address = address
        self.password = password
        self.modset = modset

        try:
            await self.__build_embed(context=context)

            message = await context.channel.send(embed=self.embed)

            self.message_id = int(message.id)
            self.guild_id = int(context.guild.id)
            self.channel_id = int(context.channel.id)

            await self.database.connect()
            await self.database.query(
                """
                INSERT INTO game_server
                (guild_id, channel_id, message_id, address, password, modset)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (self.guild_id, self.channel_id, self.message_id, address, password, modset)
            )

            print('Info panel created')
            await context.channel.send('Info panel created', delete_after=5.0)
        except Exception as e:
            print('Creating server info embed failed: ', e)
            await context.channel.send(f'Creating server info embed failed: {e}', delete_after=5.0)

    async def delete_embed(self, context: Context) -> None:
        if not self.message_id:
            print('Info panel does not exist')
            await context.channel.send('Info panel does not exist', delete_after=5.0)
            return None

        try:
            message = await context.channel.fetch_message(self.message_id)
            await message.delete()

            await self.database.connect()
            await self.database.query(
                """
                DELETE FROM game_server
                WHERE message_id=%s
                """,
                [self.message_id]
            )

            print('Info panel deleted')
            await context.channel.send('Info panel deleted', delete_after=5.0)
        except Exception as e:
            print('Deleting info panel failed: ', e)
            await context.channel.send(f'Deleting info panel failed: {e}', delete_after=5.0)
            return None

        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        self.message_id = ''
        self.player_list = ''

        await context.channel.send('Deleted info panel', delete_after=5.0)

    async def start_monitoring(self, client: Client) -> None:
        print('Starting game server monitoring...')

        self.cancel_task = False

        await client.wait_until_ready()
        while not (client.is_closed() or self.cancel_task):
            await self.refresh(client=client)
            await asyncio.sleep(self.refresh_rate)

        print('Game server monitoring stopped')

    async def stop_monitoring(self) -> None:
        print('Stopping game server monitoring...')

        self.cancel_task = True

    async def refresh(self, **kwargs) -> None:
        context = kwargs.get('context', None)
        client = kwargs.get('client', None)

        if context:
            print('Refreshing server info panel...')

        if not self.message_id:
            print('Info panel does not exist')

            if context:
                await context.channel.send('Info panel does not exist', delete_after=5.0)

            return None

        await self.__build_embed()

        try:
            channel = context.channel if context else client.get_channel(self.channel_id)

            if not channel:
                raise Exception('Channel is not found')

            message = await channel.fetch_message(self.message_id)

            if not message:
                raise Exception('Message is not found')

            await message.edit(embed=self.embed)
        except Exception as e:
            print('Failed to fetch channel/message: ', e)

            return None

    async def __build_embed(self, context: Context = None) -> None:
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

    async def __init_details(self, context: Context) -> None:
        try:
            with valve.source.a2s.ServerQuerier((os.environ['RCON_IP'], int(os.environ['QUERY_PORT']))) as server:
                self.name = server.info().values['server_name']

            self.embed.add_field(
                name='Details',
                value='```\nServer name: {}\nAddress: {}\nPassword: {}```'.format(
                    self.name, self.address, self.password
                ),
                inline=False
            )
        except Exception as e:
            print('Creating Details field failed: ', e)

            if context:
                await context.channel.send('Creating Details field failed: ', e)

    async def __init_player_count(self, context: Context) -> None:
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

            if context:
                await context.channel.send('Creating Player field count failed: ', e)

    async def __init_modset(self, context: Context) -> None:
        try:
            self.embed.add_field(
                name='Modset',
                value='{}'.format(self.modset),
                inline=False
            )
        except Exception as e:
            print('Creating Modset field failed: ', e)

            if context:
                await context.channel.send('Creating Modset field failed: ', e)

    async def __init_player_list(self, context: Context) -> None:
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

            if context:
                await context.channel.send('Creating Player list field failed: ', e)

    async def __init_footer(self, context: Context) -> None:
        try:
            self.timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            self.embed.set_footer(
                text='Last updated: {}'.format(self.timestamp),
                icon_url='https://probot.media/tUE1WGMdwV.png'
            )
        except Exception as e:
            print('Creating Timestamp failed: ', e)

            if context:
                await context.channel.send('Creating Timestamp field failed: ', e)
