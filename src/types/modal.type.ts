import { Client, ModalSubmitInteraction } from 'discord.js';

export interface Modal {
    data: { name: string };
    run: (client: Client, interaction: ModalSubmitInteraction) => Promise<void>;
}
