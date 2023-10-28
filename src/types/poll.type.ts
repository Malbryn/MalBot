import { PollOption } from './poll-option.type';

export type Poll = {
    title: string;
    options: Map<number, PollOption>;
    duration: number;
    allowMultiple: boolean;
    channelId: string | undefined;
    createdBy: string;
    voters: Set<string>;
};
