import { Modal } from 'src/interfaces/Modal';
import { CreateServerModal } from './server_info/create-server.modal';

export const modalMap: Map<string, Modal> = new Map<string, Modal>();

modalMap.set(CreateServerModal.data.name, CreateServerModal);
