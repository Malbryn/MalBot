import {
    EmbedBuilder,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import {
    GuildNodeCreateOptions,
    GuildQueue,
    Player,
    SearchResult,
    Track,
    useMainPlayer,
} from 'discord-player';
import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    SlashCommandBuilder,
    VoiceBasedChannel,
} from 'discord.js';
import { Command } from '../command';
import { logger } from '../../../index';
import { config, embedColours } from '../../../config/config';

export class PlayCommand extends Command {
    static readonly NAME: string = 'play';
    private static instance: PlayCommand;

    private constructor() {
        super();
    }

    public static getInstance(): PlayCommand {
        if (!PlayCommand.instance) {
            PlayCommand.instance = new PlayCommand();
        }

        return PlayCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(PlayCommand.NAME)
            .setDescription('Plays a song or playlist.')
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand
                    .setName('song')
                    .setDescription('Plays a song.')
                    .addStringOption((option: SlashCommandStringOption) =>
                        option
                            .setName('query')
                            .setDescription('Song URL or search keywords')
                            .setRequired(true),
                    ),
            );
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        try {
            const voiceChannel: VoiceBasedChannel | undefined =
                this.getUserVoiceChannel(interaction);

            if (!voiceChannel) {
                return await this.handleError(
                    interaction,
                    'You must be in a voice channel to use this command',
                );
            }

            await this.sendSimpleReply(interaction, '🔎 Searching...');

            const track: Track = await this.handleQuery(interaction);
            const queue: GuildQueue = await this.initGuildQueue(
                interaction,
                voiceChannel,
            );

            queue.addTrack(track);

            logger.debug(
                `Track added to queue [Title: ${track.title}] [Duration: ${track.duration}] [Type: ${track.queryType}] [URL: ${track.url}]`,
            );

            await this.sendTrackInfo(interaction, track);

            if (!queue.isPlaying()) {
                await queue.node.play();
            }
        } catch (error) {
            logger.warn(
                `Failed to play song or playlist [Reason: ${(error as Error).message}]`,
            );

            await this.handleError(interaction, 'Failed to play song');
        }
    }

    private getUserVoiceChannel(
        interaction: ChatInputCommandInteraction,
    ): VoiceBasedChannel | undefined {
        const guild: Guild | null = interaction.guild;

        if (!guild) {
            throw new Error(
                'Cannot get user voice channel: Guild is not found',
            );
        }

        const userId: string = interaction.user.id;
        const member: GuildMember | undefined = guild.members.cache.get(userId);

        if (!member) {
            throw new Error(
                'Cannot get user voice channel: Guild member is not found',
            );
        }

        return member.voice.channel ?? undefined;
    }

    private async initGuildQueue(
        interaction: ChatInputCommandInteraction,
        voiceChannel: VoiceBasedChannel,
    ): Promise<GuildQueue> {
        const player: Player = useMainPlayer();
        const guild: Guild | null = interaction.guild;

        if (!guild) {
            throw new Error('Cannot init guild queue: Guild is not found');
        }

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
        };

        let queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

        if (!queue) {
            queue = player.nodes.create(guild, queueOptions);
        }

        if (!queue.connection) {
            await queue.connect(voiceChannel);
        }

        return queue;
    }

    private async handleQuery(
        interaction: ChatInputCommandInteraction,
    ): Promise<Track> {
        const player: Player = useMainPlayer();
        const query: string | null = interaction.options.getString('query');

        if (!query) {
            throw new Error('Cannot handle query: Query is null');
        }

        logger.debug(`Song requested [Query: ${query}]`);

        const result: SearchResult = await player.search(query, {
            requestedBy: interaction.user,
        });

        if (result.tracks.length === 0) {
            throw new Error('Cannot handle query: No results found');
        }

        return result.tracks[0];
    }

    private async sendTrackInfo(
        interaction: ChatInputCommandInteraction,
        track: Track,
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder
            .setTitle(`**${track.title}**`)
            .setURL(track.url)
            .setColor(embedColours.INFO)
            .setThumbnail(track.thumbnail)
            .setAuthor({
                name: '▶️ Added song to the queue',
            })
            .setFooter({
                text: `Duration: ${track.duration}`,
            });

        await interaction.editReply({
            embeds: [embedBuilder],
        });
    }
}
