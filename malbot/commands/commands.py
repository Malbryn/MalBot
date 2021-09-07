from abc import ABC

from discord import Client
from discord_slash import SlashCommand


class Commands(ABC):
    def __init__(self, name: str, client: Client, command: SlashCommand):
        self.name = name
        self.client = client
        self.command = command

    def init(self):
        pass
