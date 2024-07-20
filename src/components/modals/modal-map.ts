import { CreateServerMonitorModal } from './server_monitor/create-server-monitor.modal';
import { Modal } from './modal';

export const MODAL_MAP: Map<string, Modal> = new Map()
    // Server monitoring
    .set(CreateServerMonitorModal.NAME, CreateServerMonitorModal.getInstance());
