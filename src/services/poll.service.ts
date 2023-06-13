import { embedColours } from '../config/config';
import { Poll } from '../interfaces/Poll';
import { APIEmbedField, TextChannel } from 'discord.js';
import { client, logger } from '../main';
import { EmbedBuilder } from '@discordjs/builders';
import { PollOption } from '../interfaces/PollOption';

export class PollService {
    poll: Poll | undefined;
    intervalId: number | undefined;

    private static instance: PollService;

    private constructor() {}

    public static getInstance(): PollService {
        if (!PollService.instance) {
            PollService.instance = new PollService();
        }

        return PollService.instance;
    }

    public startPoll(poll: Poll): void {
        logger.info(
            `Starting poll [Title: ${poll.title}] [Multi-select: ${poll.allowMultiple}] [Duration: ${poll.duration}] [Created by: ${poll.createdBy}]`
        );

        if (this.poll) {
            logger.info('Cancelling running poll: ', this.poll?.title);

            this.stopPoll();
        }

        this.poll = poll;

        this.intervalId = setTimeout(async (poll: Poll) => {
            try {
                await this.getResult();
            } catch (error: any) {
                logger.error('Cannot get results: ', error.message);
            } finally {
                this.resetState();
            }
        }, this.getDurationInMs(poll));
    }

    public async stopPoll(): Promise<void> {
        if (this.intervalId) {
            clearTimeout(this.intervalId);

            try {
                await this.getResult();
            } catch (error: any) {
                logger.error('Cannot get results: ', error.message);
            } finally {
                this.resetState();
            }
        } else {
            logger.warn('No poll is in progress');
        }
    }

    public handleVote(ids: number[], clientId: string): string[] {
        if (!this.poll) throw new Error('No poll is in progress');
        if (this.poll.voters.has(clientId))
            throw new Error('User already voted');

        let votes: string[] = [];

        for (const id of ids) {
            let current: PollOption | undefined = this.poll?.options.get(id);
            if (!current) throw new Error('ID is not found');

            const option = this.poll?.options.get(id);
            if (!option) throw new Error('Option is not found');

            option.voteCount++;
            this.poll?.options.set(id, option);
            votes.push(this.poll?.options.get(id)?.name ?? '');
        }

        this.poll.voters.add(clientId);

        return votes;
    }

    private async getResult(): Promise<void> {
        logger.info('Getting poll results');

        if (!this.poll) throw new Error('Poll is not found');
        if (!this.poll.channelId) throw new Error('Channel ID is not found');

        const channel: TextChannel | undefined = client.channels.cache.get(
            this.poll.channelId
        ) as TextChannel;

        if (!channel) throw new Error('Channel is not found');

        // Sort by votes and add fields
        let fields: APIEmbedField[] = [];
        const sortedPollOptions: PollOption[] = this.sortPollOptions(this.poll);

        for (const pollOption of sortedPollOptions) {
            fields.push({
                name: `${pollOption.name} - [${pollOption.voteCount} votes]`,
                value: ' ',
            });
        }

        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder
            .setTitle(this.poll.title)
            .setDescription('**Results:**')
            .setColor(embedColours.INFO)
            .setFooter({
                text: `Poll created by ${this.poll.createdBy}`,
                iconURL: channel.guild.iconURL() ?? '',
            })
            .addFields(fields);

        await channel.send({ embeds: [embedBuilder] });
    }

    private resetState(): void {
        this.poll = undefined;
        this.intervalId = undefined;
    }

    private getDurationInMs(poll: Poll): number {
        const MIN_LIMIT: number = 60000; // 1 minute
        const minutes: number = poll.duration;
        const ms: number = minutes * 60 * 1000;

        return ms < MIN_LIMIT ? MIN_LIMIT : ms;
    }

    private sortPollOptions(poll: Poll): PollOption[] {
        const pollOptions: PollOption[] = Array.from(poll.options.values());

        pollOptions.sort((a, b) => b.voteCount - a.voteCount);

        return pollOptions;
    }
}
