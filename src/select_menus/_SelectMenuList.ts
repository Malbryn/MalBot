import { SelectMenu } from '../interfaces/SelectMenu';
import { VoteSelectMenu } from './poll/vote.select-menu';
import { ServerMonitorSelectMenu } from './server_info/create_server.select-menu';

export const selectMenuMap: Map<string, SelectMenu> = new Map<
    string,
    SelectMenu
>();

selectMenuMap.set(VoteSelectMenu.data.name, VoteSelectMenu);
selectMenuMap.set(ServerMonitorSelectMenu.data.name, ServerMonitorSelectMenu);
