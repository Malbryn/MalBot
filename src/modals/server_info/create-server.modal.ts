import { EmbedBuilder } from '@discordjs/builders';
import { Client, Message, ModalSubmitInteraction } from 'discord.js';
import { embedColours } from '../../config/config';
import { Modal } from '../../interfaces/Modal';
import { ServerInfo } from '../../interfaces/ServerInfo';
import { DatabaseService } from '../../lib/database.service';

export const CreateServerModal: Modal = {
    data: { name: 'CreateServerInfoModal' },
    async run(
        client: Client,
        interaction: ModalSubmitInteraction
    ): Promise<void> {
        await interaction.reply('Creating new server info panel...');

        // Create new embed
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

        await interaction.deleteReply();
        const message: Message | undefined = await interaction.channel?.send({
            embeds: [embedBuilder],
        });

        if (message) {
            const serverInfo: ServerInfo = {
                ip: interaction.fields.getTextInputValue('serverIP'),
                port: interaction.fields.getTextInputValue('serverPort'),
                password: interaction.fields.getTextInputValue('password'),
                modset: interaction.fields.getTextInputValue('modset'),
                embedId: message.id,
            };

            const databaseService: DatabaseService =
                DatabaseService.getInstance();
            await databaseService.serverInfoModel.create(serverInfo);
        }
    },
};
