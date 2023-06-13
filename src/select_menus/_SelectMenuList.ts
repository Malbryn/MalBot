import { SelectMenu } from '../interfaces/SelectMenu';
import { VoteSelectMenu } from './poll/vote.select-menu';

export const selectMenuMap: Map<string, SelectMenu> = new Map<
    string,
    SelectMenu
>();

selectMenuMap.set(VoteSelectMenu.data.name, VoteSelectMenu);
