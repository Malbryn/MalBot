from abc import ABC

from discord.ext.commands import Bot
from discord_slash import SlashCommand


class Commands(ABC):
    def __init__(self, name: str, client: Bot, command: SlashCommand):
        self.name = name
        self.client = client
        self.command = command

    def init(self):
        pass
