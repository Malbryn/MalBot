import { Modal } from 'src/interfaces/Modal';
import { Create } from './server_info/Create';

export const modalMap: Map<string, Modal> = new Map<string, Modal>();

modalMap.set(Create.data.name, Create);
