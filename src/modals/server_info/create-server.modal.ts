import { EmbedBuilder } from '@discordjs/builders';
import { Client, ModalSubmitInteraction } from 'discord.js';
import { Model } from 'sequelize';
import { embedColours } from '../../config/config';
import { Modal } from '../../interfaces/Modal';
import { ServerInfo } from '../../interfaces/ServerInfo';
import { serverInfoModel } from '../../main';

export const CreateServerModal: Modal = {
    data: { name: 'CreateServerInfoModal' },
    async run(
        client: Client,
        interaction: ModalSubmitInteraction
    ): Promise<void> {
        // CreateServerCommand new database record
        const serverInfo: ServerInfo = {
            ip: interaction.fields.getTextInputValue('serverIP'),
            port: interaction.fields.getTextInputValue('serverPort'),
            password: interaction.fields.getTextInputValue('password'),
            modset: interaction.fields.getTextInputValue('modset'),
        };

        const record: Model<ServerInfo> = await serverInfoModel.create(
            serverInfo
        );

        await interaction.reply('asd');

        // CreateServerCommand new embed
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder
            .setTitle('Server Info')
            .setColor(embedColours.INFO)
            .addFields(
                { name: 'Details', value: '```1```' },
                { name: 'Modset', value: '```2```' },
                { name: 'Player count', value: '```3```' },
                { name: 'Player list', value: '```4```' }
            );

        await interaction.channel?.send({ embeds: [embedBuilder] });
    },
};
