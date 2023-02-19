import {
    EmbedBuilder,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import { PlayerSearchResult, QueryType, Queue, Track } from 'discord-player';
import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    SlashCommandBuilder,
    VoiceBasedChannel,
} from 'discord.js';
import { Logger } from 'tslog';
import { config } from '../config/config';
import { Command } from '../interfaces/Command';
import { ExtendedClient } from '../models/ExtendedClient';

const logger = new Logger(config.LOGGER_SETTINGS);

enum SUBCOMMANDS {
    SEARCH = 'search',
    SONG = 'song',
    PLAYLIST = 'playlist',
}

export const Play: Command = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song.')
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName(SUBCOMMANDS.SEARCH)
                .setDescription('Searches for a song.')
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName('searchterms')
                        .setDescription('keywords')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName(SUBCOMMANDS.PLAYLIST)
                .setDescription('Plays a playlist from YouTube')
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName('url')
                        .setDescription('playlist url')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName(SUBCOMMANDS.SONG)
                .setDescription('Plays a song from YouTube')
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName('url')
                        .setDescription('song url')
                        .setRequired(true)
                )
        ),
    async run(
        client: ExtendedClient,
        interaction: ChatInputCommandInteraction
    ) {
        const voiceChannel: VoiceBasedChannel | undefined = getVoiceChannel(
            client,
            interaction
        );

        if (voiceChannel) {
            const queue: Queue | undefined = createQueue(client, interaction);

            if (queue) {
                await connectToVoiceChannel(queue, voiceChannel);

                const subcommand: string = interaction.options.getSubcommand();
                const embedBuilder = new EmbedBuilder();

                try {
                    await handleSubcommand(
                        client,
                        interaction,
                        queue,
                        subcommand,
                        embedBuilder
                    );

                    await interaction.reply({
                        embeds: [embedBuilder],
                    });
                } catch (error) {
                    await interaction.reply((error as Error).message);
                }
            }
        } else {
            await interaction.reply(
                'You must be in a voice channel to use this command.'
            );
        }
    },
};

function getVoiceChannel(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction
): VoiceBasedChannel | undefined {
    const userId: string | undefined = interaction.member?.user.id;

    if (userId) {
        const guild: Guild | undefined = getGuild(client, interaction);
        const member: GuildMember | undefined =
            guild?.members.cache.get(userId);

        return member?.voice.channel ?? undefined;
    } else return undefined;
}

function getGuild(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction
): Guild | undefined {
    const guildId: string | null = interaction.guildId;

    return guildId ? client.guilds.cache.get(guildId) : undefined;
}

function createQueue(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction
): Queue | undefined {
    const guild: Guild | undefined = getGuild(client, interaction);

    return guild ? client.player?.createQueue(guild) : undefined;
}

async function connectToVoiceChannel(
    queue: Queue,
    voiceChannel: VoiceBasedChannel
): Promise<void> {
    if (!queue.connection) await queue?.connect(voiceChannel);
}

async function handleSubcommand(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
    queue: Queue,
    subcommand: string,
    embedBuilder: EmbedBuilder
): Promise<void> {
    switch (subcommand) {
        case SUBCOMMANDS.SONG: {
            await handleSongRequest(client, interaction, queue, embedBuilder);

            break;
        }

        case SUBCOMMANDS.SEARCH: {
            await handleSearchRequest();

            break;
        }

        case SUBCOMMANDS.PLAYLIST: {
            await handlePlaylistRequest();

            break;
        }

        default:
            break;
    }
}

async function handleSongRequest(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
    queue: Queue,
    embedBuilder: EmbedBuilder
): Promise<void> {
    const url: string | null = interaction.options.getString('url');

    if (!url) throw new Error('URL is missing!');
    if (!client.player) throw new Error('Client player is not initialised!');

    logger.debug(`Song requested [URL: ${url}]`);

    const result: PlayerSearchResult = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
    });

    if (result.tracks.length === 0) throw new Error('No results found!');

    const song: Track = result?.tracks[0];
    queue.addTrack(song);

    logger.debug(
        `Track added to queue [Title: ${song.title}] [Duration: ${song.duration}]`
    );

    if (!queue.playing) await queue.play();

    embedBuilder
        .setDescription(`Added **[${song.title}](${song.url})** to the queue`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
}

async function handleSearchRequest() {
    throw new Error('Not yet implemented!');
}

async function handlePlaylistRequest() {
    throw new Error('Not yet implemented!');
}
