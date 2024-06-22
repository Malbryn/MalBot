import { ModalSubmitInteraction } from 'discord.js';

export interface Modal {
    data: { name: string };
    execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}
