import { Client, ModalSubmitInteraction } from 'discord.js';
import { Modal } from '../../interfaces/Modal';
import { serverInfoModel } from '../../main';
import { ServerInfo } from 'src/interfaces/ServerInfo';
import { Model } from 'sequelize';

export const Create: Modal = {
    data: { name: 'CreateServerInfoModal' },
    async run(client: Client, interaction: ModalSubmitInteraction) {
        const serverInfo: ServerInfo = {
            ip: interaction.fields.getTextInputValue('serverIP'),
            port: interaction.fields.getTextInputValue('serverPort'),
            password: interaction.fields.getTextInputValue('password'),
            modset: interaction.fields.getTextInputValue('modset'),
        };

        const record: Model<ServerInfo> = await serverInfoModel.create(
            serverInfo
        );

        await interaction.reply({
            content: `New record ID: ${record.get('id')}`,
        });
    },
};
