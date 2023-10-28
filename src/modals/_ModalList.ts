import { Modal } from 'src/types/modal.type';
import { CreateServerModal } from './server_info/create-server.modal';
import { CreateSingleSelectPollModal } from './poll/create-single-select-poll.modal';
import { CreateMultiSelectPollModal } from './poll/create-multi-select-poll.modal';

export const modalMap: Map<string, Modal> = new Map<string, Modal>();

// Poll
modalMap.set(
    CreateSingleSelectPollModal.data.name,
    CreateSingleSelectPollModal
);
modalMap.set(CreateMultiSelectPollModal.data.name, CreateMultiSelectPollModal);

// Server info
modalMap.set(CreateServerModal.data.name, CreateServerModal);
