import os
import bec_rcon
import requests

from steam.webapi import WebAPI
from malbot.log import init_logger


class RCON:
    def __init__(self, api):
        self.api_endpoint = api
        self.logger = init_logger()

    async def get_player_list(self):
        player_steam_ids = await self.__convert_guids(await self.__get_players())
        players = await self.__get_all_names_by_steam_ids(player_steam_ids)

        return players

    async def send_global_message(self, context, message):
        await context.send('Message sent > {}'.format(message))\
            if await self.__send_message(message=message, player_id=-1)\
            else await context.send('Failed to send message > {}'.format(message))

    async def __rcon_connect(self):
        try:
            rcon_client = bec_rcon.ARC(os.environ['RCON_IP'], os.environ['RCON_PASSWORD'], int(os.environ['RCON_PORT']))
            rcon_client.add_Event('received_ServerMessage', self.__handle_message)

            self.logger.info('RCON connection successful')

            return rcon_client
        except Exception as e:
            self.logger.error('RCON connection failed: ', e)

            return None

    def __handle_message(self, args):
        message = args[0]
        print(message)
        self.logger.info(message)

        return None

    async def __get_players(self):
        try:
            rcon_client = await self.__rcon_connect()

            return await rcon_client.getPlayersArray()
        except Exception as e:
            self.logger.error('Getting player list failed: ', e)

            return []
        finally:
            rcon_client.disconnect()

            self.logger.info('RCON client disconnected')

    async def __convert_guids(self, all_player_info):
        try:
            guids = '['

            for player_info in all_player_info:
                guids += '"{}",'.format(player_info[3])

            guids = guids.rstrip(guids[-1])
            guids += ']'

            response = requests.post(url=self.api_endpoint, data=guids)
            json = response.json()
        except Exception as e:
            self.logger.error('Converting GUID\'s failed: ', e)
            return None

        steam_ids = []

        for guid in json['data']:
            steam_ids.append(json['data'][guid])

        return steam_ids

    async def __get_name_by_steam_id(self, steam_id):
        try:
            api = WebAPI(key=os.environ['STEAM_API_KEY'])
            api.ISteamUser.GetPlayerSummaries(steamids=steam_id)
            response = api.call('ISteamUser.GetPlayerSummaries', steamids=steam_id)
        except Exception as e:
            self.logger.error('Getting Steam profile name failed: ', e)
            return None

        return response['response']['players'][0]['personaname']

    async def __get_all_names_by_steam_ids(self, steam_ids):
        profile_names = []

        for current_id in steam_ids:
            profile_names.append(await self.__get_name_by_steam_id(current_id))

        return profile_names

    async def __send_message(self, message, player_id=-1):
        try:
            rcon_client = await self.__rcon_connect()
            await rcon_client.sayGlobal(message) if player_id == -1 else await rcon_client.sayPlayer(player_id, message)

            return True
        except Exception as e:
            self.logger.error('Sending RCON message failed: ', e)

            return False
        finally:
            rcon_client.disconnect()

            self.logger.info('RCON client disconnected')
