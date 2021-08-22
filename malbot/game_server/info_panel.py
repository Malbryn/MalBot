import os
import discord
import valve.source.a2s
import time

from datetime import datetime

from malbot.log import init_logger


class InfoPanel:
    def __init__(self):
        self.rcon_client = None

        self.name = '<unknown>'
        self.address = '<unknown>'
        self.password = '<unknown>'
        self.modset = ''

        self.current_player_count = 999
        self.max_player_count = 999

        self.player_list = ''

        self.timestamp = ''

        self.message_id = ''
        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        self.logger = init_logger()

    async def create_server_info_panel(self, rcon_client, context, address, password, modset):
        if self.message_id:
            self.logger.warning('Info panel already exist, '
                                'please delete the old one first using /delete_server_info_panel command')
            await context.send('Info panel already exist, '
                               'please delete the old one first using `/delete_server_info_panel` command')
            return None

        await context.send('Building server info panel...', delete_after=5.0)

        self.rcon_client = rcon_client

        self.address = address
        self.password = password
        self.modset = modset

        await self.__build_embed(context=context)

        try:
            message = await context.channel.send(embed=self.embed)
            self.message_id = message.id
        except Exception as e:
            self.logger.error('Creating server info embed failed: ', e)
            await context.channel.send('Creating server info embed failed: ', e)

    async def delete_server_info_panel(self, context):
        if not self.message_id:
            self.logger.warning('Info panel does not exist')
            await context.send('Info panel does not exist')
            return None

        try:
            message = await context.channel.fetch_message(self.message_id)
            await message.delete()
        except Exception as e:
            self.logger.error('Deleting info panel failed: ', e)
            await context.send('Deleting info panel failed: {}'.format(e))
            return None

        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        self.message_id = ''
        self.player_list = ''

        await context.send('Deleted info panel', delete_after=5.0)

    async def refresh_server_info_panel(self, context):
        if not self.message_id:
            self.logger.warning('Info panel does not exist')
            await context.send('Info panel does not exist')
            return None

        await context.send('Refreshing server info panel...', delete_after=5.0)

        await self.__build_embed(self)

        message = await context.channel.fetch_message(self.message_id)
        await message.edit(embed=self.embed)

    async def reattach_server_info_panel(self, context, rcon_client, message_id, address, password, modset):
        if self.message_id:
            self.logger.warning('Info panel is attached, no need to reattach it')
            await context.send('Info panel is attached, no need to reattach it')
            return None

        await context.send('Reattaching...', delete_after=5.0)

        self.message_id = int(message_id)
        self.rcon_client = rcon_client

        self.address = address
        self.password = password
        self.modset = modset

        await self.__build_embed(self)

        self.logger.info('Server info panel reattached using ID of {}'.format(self.message_id))
        await context.send('Message ID updated', delete_after=5.0)

    async def __build_embed(self, context):
        self.logger.info('Started building embed')

        self.embed = discord.Embed(
            title='Server Info',
            colour=0x4C91E3
        )

        await self.__init_details(context=context)
        await self.__init_player_count(context=context)
        await self.__init_modset(context=context)
        await self.__init_player_list(context=context)
        await self.__init_footer(context=context)

        self.logger.info('Finished building embed')

    async def __init_details(self, context):
        with valve.source.a2s.ServerQuerier((os.environ['RCON_IP'], int(os.environ['QUERY_PORT']))) as server:
            self.name = server.info().values['server_name']

        try:
            self.embed.add_field(
                name='Details',
                value='```\nServer name: {}\nAddress: {}\nPassword: {}```'.format(
                    self.name, self.address, self.password
                ),
                inline=True
            )
        except Exception as e:
            self.logger.error('Creating Details field failed: ', e)
            await context.channel.send('Creating Details field failed: ', e)

    async def __init_player_count(self, context):
        try:
            with valve.source.a2s.ServerQuerier((os.environ['RCON_IP'], int(os.environ['QUERY_PORT']))) as server:
                self.max_player_count = server.info().values['max_players']
                self.current_player_count = server.info().values['player_count']

            self.embed.add_field(
                name='Player count',
                value='```\n{}/{}```'.format(self.current_player_count, self.max_player_count),
                inline=True
            )
        except Exception as e:
            self.logger.error('Creating Player count field failed: ', e)
            await context.channel.send('Creating Player field count failed: ', e)

    async def __init_modset(self, context):
        try:
            self.embed.add_field(
                name='Modset',
                value='{}'.format(self.modset),
                inline=False
            )
        except Exception as e:
            self.logger.error('Creating Modset field failed: ', e)
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

                info = '{}. {} ({}ms) - {}\n'.format(
                    players[i-1].rcon_id, players[i-1].name, players[i-1].ping, players[i-1].duration
                )
                self.player_list += info

            self.embed.add_field(
                name='Player list',
                value='```\nID | Name (Ping) | Time playing\n{}```'.format(self.player_list),
                inline=False
            )
        except Exception as e:
            self.logger.error('Creating Player list field failed: ', e)
            await context.channel.send('Creating Player list field failed: ', e)

    async def __init_footer(self, context):
        try:
            self.timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            self.embed.set_footer(
                text='Last updated: {}'.format(self.timestamp),
                icon_url='https://probot.media/tUE1WGMdwV.png'
            )
        except Exception as e:
            self.logger.error('Creating Timestamp failed: ', e)
            await context.channel.send('Creating Timestamp field failed: ', e)
