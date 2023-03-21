import { Client, ModalSubmitInteraction } from 'discord.js';
import { Modal } from '../../interfaces/Modal';

export const Create: Modal = {
    data: { name: 'CreateServerInfoModal' },
    async run(client: Client, interaction: ModalSubmitInteraction) {
        const ip: string = interaction.fields.getTextInputValue('ServerIP');
        const port: string = interaction.fields.getTextInputValue('ServerPort');
        const modset: string = interaction.fields.getTextInputValue('Modset');
        const password: string =
            interaction.fields.getTextInputValue('Password');

        await interaction.reply({ content: `${ip}:${port}` });
    },
};
