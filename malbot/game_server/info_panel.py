from datetime import datetime

import discord

from malbot.log import init_logger


class InfoPanel:
    def __init__(self):
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

    async def create_server_info_panel(self, context, address, password, modset):
        await context.send('Building server info panel...', delete_after=5.0)

        self.address = address
        self.password = password
        self.modset = modset
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        await self.__init_details(context=context)
        await self.__init_player_count(context=context)
        await self.__init_player_list(context=context)
        await self.__init_footer(context=context)

        await context.channel.send(embed=self.embed)

    async def __init_details(self, context):
        try:
            self.embed.add_field(
                name='Details',
                value='```\nServer name: {}\nAddress: {}\nPassword: {}\n\nModset: {}```'.format(
                    self.name, self.address, self.password, self.modset
                ),
                inline=True
            )
        except Exception as e:
            self.logger.error('Creating Details field failed: ', e)
            await context.channel.send('Creating Details field failed: ', e)

    async def __init_player_count(self, context):
        try:
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
            self.embed.set_footer(
                text='Last updated: {}'.format(self.timestamp),
                icon_url='https://probot.media/tUE1WGMdwV.png'
            )
        except Exception as e:
            self.logger.error('Creating Timestamp failed: ', e)
            await context.channel.send('Creating Timestamp field failed: ', e)
