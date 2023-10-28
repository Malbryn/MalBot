import { SelectMenu } from '../types/select-menu.type';
import { VoteSelectMenu } from './poll/vote.select-menu';
import { ServerMonitorSelectMenu } from './server_info/create_server.select-menu';

export const selectMenuMap: Map<string, SelectMenu> = new Map<
    string,
    SelectMenu
>();

// Poll
selectMenuMap.set(VoteSelectMenu.data.name, VoteSelectMenu);

// Server info
selectMenuMap.set(ServerMonitorSelectMenu.data.name, ServerMonitorSelectMenu);
