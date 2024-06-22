import { SelectMenu } from '../types/select-menu.type';
import { ServerMonitorSelectMenu } from './server_info/create_server.select-menu';

export const selectMenuMap: Map<string, SelectMenu> = new Map<
    string,
    SelectMenu
>();

// Server info
selectMenuMap.set(ServerMonitorSelectMenu.data.name, ServerMonitorSelectMenu);
