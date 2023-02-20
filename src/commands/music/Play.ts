import {
    EmbedBuilder,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import {
    Player,
    PlayerSearchResult,
    Playlist,
    QueryType,
    Queue,
    Track,
} from 'discord-player';
import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    SlashCommandBuilder,
    VoiceBasedChannel,
} from 'discord.js';
import { Logger } from 'tslog';
import { config } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { ExtendedClient } from '../../models/ExtendedClient';

const logger = new Logger(config.LOGGER_SETTINGS);

enum SUBCOMMANDS {
    SONG = 'song',
    PLAYLIST = 'playlist',
}

export const Play: Command = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName(SUBCOMMANDS.SONG)
                .setDescription('Plays a song from YouTube.')
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName('query')
                        .setDescription('Song URL or search keywords')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName(SUBCOMMANDS.PLAYLIST)
                .setDescription('Plays a playlist from YouTube.')
                .addStringOption((option: SlashCommandStringOption) =>
                    option
                        .setName('url')
                        .setDescription('Playlist URL')
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
                const embedBuilder: EmbedBuilder = new EmbedBuilder();

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
                    const message = (error as Error).message;

                    logger.warn(
                        `Failed to play song or playlist [Reason: ${message}]`
                    );
                    await interaction.reply(message);
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
    if (!queue.connection) await queue.connect(voiceChannel);
}

async function handleSubcommand(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
    queue: Queue,
    subcommand: string,
    embedBuilder: EmbedBuilder
): Promise<void> {
    const player: Player | undefined = client.player;

    if (!player) throw new Error('Player is not initialised!');

    if (subcommand === SUBCOMMANDS.SONG) {
        await handleSongRequest(interaction, player, queue, embedBuilder);
    } else {
        await handlePlaylistRequest(interaction, player, queue, embedBuilder);
    }
}

async function handleSongRequest(
    interaction: ChatInputCommandInteraction,
    player: Player,
    queue: Queue,
    embedBuilder: EmbedBuilder
): Promise<void> {
    const query: string | null = interaction.options.getString('query');

    if (!query) throw new Error('Query is missing!');

    const isUrl: boolean = isYoutubeUrl(query);

    logger.debug(`Song requested [Query: ${query}] [URL: ${isUrl}]`);

    const searchEngine: QueryType = isUrl
        ? QueryType.YOUTUBE_VIDEO
        : QueryType.YOUTUBE_SEARCH;
    const result: PlayerSearchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine,
    });

    if (result.tracks.length === 0) throw new Error('No results found!');

    const song: Track = await addSongToQueue(result, queue);

    embedBuilder
        .setDescription(`Added **[${song.title}](${song.url})** to the queue`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
}

async function handlePlaylistRequest(
    interaction: ChatInputCommandInteraction,
    player: Player,
    queue: Queue,
    embedBuilder: EmbedBuilder
) {
    const url: string | null = interaction.options.getString('url');

    if (!url) throw new Error('URL is missing!');

    logger.debug(`Playlist requested [URL: ${url}]`);

    const result: PlayerSearchResult = await player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
    });
    const tracks: Track[] = result.tracks;

    if (tracks.length === 0) throw new Error('No playlist found!');

    const playlist: Playlist | null = result.playlist;

    if (playlist) {
        queue.addTracks(tracks);

        logger.debug(`Playlist added to queue [Title: ${playlist.title}]`);

        if (!queue.playing) await queue.play();

        embedBuilder
            .setDescription(
                `**${tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue`
            )
            .setThumbnail(playlist.thumbnail);
    }
}

async function addSongToQueue(
    result: PlayerSearchResult,
    queue: Queue
): Promise<Track> {
    const song: Track = result.tracks[0];

    queue.addTrack(song);

    logger.debug(
        `Track added to queue [Title: ${song.title}] [Duration: ${song.duration}]`
    );

    // TODO: 'queue.playing' is currently broken on 5.4.0
    if (!queue.playing) await queue.play();

    return song;
}

function isYoutubeUrl(query: string): boolean {
    const regExp: RegExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

    return query.match(regExp) !== null;
}
