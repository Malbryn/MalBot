import {
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import {
    GuildNodeCreateOptions,
    GuildQueue,
    Playlist,
    QueryType,
    SearchResult,
    Track,
} from 'discord-player';
import {
    ChatInputCommandInteraction,
    Client,
    Guild,
    GuildMember,
    SlashCommandBuilder,
    VoiceBasedChannel,
} from 'discord.js';
import { Logger } from 'tslog';
import { config, embedColours } from '../../config/config';
import { Command } from '../../interfaces/Command';
import { player } from '../../main';

const logger = new Logger(config.LOGGER_SETTINGS);

enum SUBCOMMANDS {
    SONG = 'song',
    PLAYLIST = 'playlist',
}

export const PlayCommand: Command = {
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
        client: Client,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder.setColor(embedColours.INFO).setAuthor({
            name: '🔎 Searching...',
        } as EmbedAuthorOptions);

        await interaction.reply({
            embeds: [embedBuilder],
            fetchReply: true,
        });

        const voiceChannel: VoiceBasedChannel | undefined = getVoiceChannel(
            client,
            interaction
        );

        if (voiceChannel) {
            const queue: GuildQueue | undefined = createQueue(
                client,
                interaction
            );

            if (queue) {
                await connectToVoiceChannel(queue, voiceChannel);

                const subcommand: string = interaction.options.getSubcommand();

                try {
                    await handleSubcommand(
                        interaction,
                        subcommand,
                        embedBuilder
                    );

                    await interaction.editReply({
                        embeds: [embedBuilder],
                    });
                } catch (error) {
                    const message: string = (error as Error)?.message ?? '';
                    const errorEmbedBuilder: EmbedBuilder = new EmbedBuilder();

                    logger.warn(
                        `Failed to play song or playlist [Reason: ${message}]`
                    );

                    errorEmbedBuilder.setColor(embedColours.ERROR).setAuthor({
                        name: `❌ ${message}`,
                    } as EmbedAuthorOptions);

                    await interaction.editReply({
                        embeds: [errorEmbedBuilder],
                    });
                }
            }
        } else {
            embedBuilder.setColor(embedColours.INFO).setAuthor({
                name: '❌ You must be in a voice channel to use this command!',
            } as EmbedAuthorOptions);

            await interaction.editReply({
                embeds: [embedBuilder],
            });
        }
    },
};

function getVoiceChannel(
    client: Client,
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
    client: Client,
    interaction: ChatInputCommandInteraction
): Guild | undefined {
    const guildId: string | null = interaction.guildId;

    return guildId ? client.guilds.cache.get(guildId) : undefined;
}

function createQueue(
    client: Client,
    interaction: ChatInputCommandInteraction
): GuildQueue | undefined {
    const guild: Guild | undefined = getGuild(client, interaction);
    const queueOptions: GuildNodeCreateOptions = {
        metadata: {
            channel: interaction.channel,
            client: interaction.guild?.members.me,
            requestedBy: interaction.user,
        },
        selfDeaf: true,
        volume: 80,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 300000,
        leaveOnEnd: false,
        leaveOnEndCooldown: 300000,
    };

    return guild ? player.nodes.create(guild, queueOptions) : undefined;
}

async function connectToVoiceChannel(
    queue: GuildQueue,
    voiceChannel: VoiceBasedChannel
): Promise<void> {
    if (!queue.connection) await queue.connect(voiceChannel);
}

async function handleSubcommand(
    interaction: ChatInputCommandInteraction,
    subcommand: string,
    embedBuilder: EmbedBuilder
): Promise<void> {
    if (subcommand === SUBCOMMANDS.SONG) {
        await handleSongRequest(interaction, embedBuilder);
    } else {
        await handlePlaylistRequest(interaction, embedBuilder);
    }
}
async function handleSongRequest(
    interaction: ChatInputCommandInteraction,
    embedBuilder: EmbedBuilder
): Promise<void> {
    const query: string | null = interaction.options.getString('query');

    if (!query) throw new Error('Query is missing!');

    const isUrl: boolean = isYoutubeUrl(query);

    logger.debug(`Song requested [Query: ${query}] [URL: ${isUrl}]`);

    const searchEngine: 'youtubeVideo' | 'youtubeSearch' = isUrl
        ? QueryType.YOUTUBE_VIDEO
        : QueryType.YOUTUBE_SEARCH;
    const result: SearchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine,
    });

    if (result.tracks.length === 0) throw new Error('No results found!');

    const song: Track = await addSongToQueue(result);

    embedBuilder
        .setTitle(`**${song.title}**`)
        .setURL(song.url)
        .setColor(embedColours.INFO)
        .setThumbnail(song.thumbnail)
        .setAuthor({
            name: '▶️ Added song to the queue',
        } as EmbedAuthorOptions)
        .setFooter({ text: `Duration: ${song.duration}` });
}

async function handlePlaylistRequest(
    interaction: ChatInputCommandInteraction,
    embedBuilder: EmbedBuilder
) {
    const url: string | null = interaction.options.getString('url');

    if (!url) throw new Error('URL is missing!');

    logger.debug(`Playlist requested [URL: ${url}]`);

    const result: SearchResult = await player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
    });
    const tracks: Track[] = result.tracks;

    if (tracks.length === 0) throw new Error('Playlist is not found!');

    const playlist: Playlist | null | undefined = result.playlist;
    const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

    if (playlist && queue) {
        queue.addTrack(tracks);

        logger.debug(`Playlist added to queue [Title: ${playlist.title}]`);

        if (!queue.node.isPlaying()) await queue.node.play();

        embedBuilder
            .setTitle(`**${playlist.title}**`)
            .setURL(playlist.url)
            .setColor(embedColours.INFO)
            // @ts-ignore
            .setThumbnail(playlist.thumbnail.url)
            .setAuthor({
                name: '▶️ Added playlist to the queue',
            } as EmbedAuthorOptions)
            .setFooter({ text: `${tracks.length} items` });
    }
}

async function addSongToQueue(result: SearchResult): Promise<Track> {
    const track: Track = result.tracks[0];
    const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

    if (queue) {
        queue.addTrack(track);

        logger.debug(
            `Track added to queue [Title: ${track.title}] [Duration: ${track.duration}]`
        );
    } else throw new Error('QueueCommand is not initialised!');

    if (!queue.node.isPlaying()) await queue.node.play();

    return track;
}

function isYoutubeUrl(query: string): boolean {
    const regExp: RegExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

    return query.match(regExp) !== null;
}
