import asyncio

import discord
import youtube_dl
from discord.ext.commands import Context

YTDL_OPTIONS = {
    'format': 'bestaudio/best',
    'restrictfilenames': True,
    'noplaylist': True,
    'nocheckcertificate': True,
    'ignoreerrors': False,
    'logtostderr': False,
    'quiet': True,
    'no_warnings': True,
    'default_search': 'auto',
    'source_address': '0.0.0.0'
}
FFMPEG_OPTIONS = {
    'options': '-vn'
}


class Music(discord.PCMVolumeTransformer):
    ytdl = youtube_dl.YoutubeDL(YTDL_OPTIONS)

    def __init__(self, source, *, data, volume=0.5, client):
        super().__init__(source, volume)

        self.client = client
        self.data = data
        self.title = data.get('title')
        self.url = ''

    @classmethod
    async def from_url(cls, url, *, loop=None, stream=False):
        loop = loop or asyncio.get_event_loop()
        data = await loop.run_in_executor(None, lambda: cls.ytdl.extract_info(url, download=not stream))

        if 'entries' in data:
            data = data['entries'][0]

        filename = data['title'] if stream else cls.ytdl.prepare_filename(data)

        return filename

    async def play(self, context: Context, url: str):
        try:
            server = context.message.guild
            voice_channel = server.voice_client

            async with context.typing():
                filename = await self.from_url(url, loop=self.client.loop)
                voice_channel.play(discord.FFmpegPCMAudio(executable='ffmpeg.exe', source=filename))

            await context.send('**Now playing:** {}'.format(filename))
        except Exception as e:
            await context.send("The bot is not connected to a voice channel.")
