import { SelectMenu } from './select-menu';
import { CreateServerMonitorSelectMenu } from './server_monitor/create-server-monitor.select-menu';

export const SELECT_MENU_MAP: Map<string, SelectMenu> = new Map().set(
    // Server monitoring
    CreateServerMonitorSelectMenu.NAME,
    CreateServerMonitorSelectMenu.getInstance(),
);
