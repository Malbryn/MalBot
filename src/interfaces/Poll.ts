import { PollOption } from './PollOption';

export interface Poll {
    title: string;
    options: Map<number, PollOption>;
    duration: number;
    allowMultiple: boolean;
    channelId: string | undefined;
    createdBy: string;
    voters: Set<string>;
}
