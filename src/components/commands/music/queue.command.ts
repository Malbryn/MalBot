import { GuildQueue, Player, Track, useMainPlayer } from 'discord-player';
import {
    APIEmbedField,
    bold,
    ChatInputCommandInteraction,
    codeBlock,
    EmbedAuthorOptions,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../command';
import { config, embedColours } from '../../../config/config';
import { logger } from '../../../index';

export class QueueCommand extends Command {
    static readonly NAME: string = 'queue';
    private static instance: QueueCommand;

    private constructor() {
        super();
    }

    public static getInstance(): QueueCommand {
        if (!QueueCommand.instance) {
            QueueCommand.instance = new QueueCommand();
        }

        return QueueCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(QueueCommand.NAME)
            .setDescription('Shows the first 10 songs in the queue.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const player: Player = useMainPlayer();
        const queue: GuildQueue | null = player.nodes.get(config.GUILD_ID);

        if (!queue) {
            return await this.handleError(interaction, 'Player queue is empty');
        }

        const tracks: Track[] = queue.tracks.store;

        logger.debug('Current queue size: ', tracks.length);

        const currentTrack: Track | null = queue.currentTrack;
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        if (currentTrack) {
            const queueString: string = this.createQueueString(tracks);
            const fields: APIEmbedField[] = [
                { name: queue.node.createProgressBar() || '', value: ' ' },
                { name: 'Queue', value: codeBlock(queueString) },
            ];

            embedBuilder
                .setTitle(bold(currentTrack.title))
                .setURL(currentTrack.url)
                .setColor(embedColours.INFO)
                .setThumbnail(currentTrack.thumbnail)
                .setAuthor({
                    name: `▶️ Currently playing`,
                } as EmbedAuthorOptions)
                .addFields(fields);
        } else {
            embedBuilder.setColor(embedColours.ERROR).setAuthor({
                name: '❌ There are no songs in the queue',
            });
        }

        await interaction.reply({
            embeds: [embedBuilder],
        });
    }

    private createQueueString(tracks: Track[]): string {
        let queueString: string = '';

        if (tracks.length == 0) {
            return 'No songs in the queue';
        }

        tracks.slice(0, 10).map((track: Track, i: number) => {
            queueString += `#${i + 1} ${track.title}\n\n`;
        });

        return queueString;
    }
}
