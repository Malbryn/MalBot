import { Modal } from 'src/types/modal.type';
import { CreateServerModal } from './server_info/create-server.modal';

export const modalMap: Map<string, Modal> = new Map<string, Modal>();

// Server info
modalMap.set(CreateServerModal.data.name, CreateServerModal);
