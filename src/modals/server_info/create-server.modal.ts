import { EmbedBuilder } from '@discordjs/builders';
import { Client, Message, ModalSubmitInteraction } from 'discord.js';
import { embedColours } from '../../config/config';
import { Modal } from '../../interfaces/Modal';
import { ServerInfo } from '../../interfaces/ServerInfo';
import { ServerMonitoringService } from '../../services/server-monitoring.service';
import { databaseService } from '../../main';

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
                { name: 'Connection details', value: '``````' },
                { name: 'Modset', value: '``````' },
                { name: 'Player count', value: '``````' },
                { name: 'Player list', value: '``````' },
                { name: 'Status', value: '``' }
            )
            .setFooter({ text: 'Last update: ' });

        await interaction.deleteReply();
        const message: Message | undefined = await interaction.channel?.send({
            embeds: [embedBuilder],
        });

        if (message) {
            const portNumber: number = Number.parseInt(
                interaction.fields.getTextInputValue('serverPort')
            );

            const serverInfo: ServerInfo = {
                ip: interaction.fields.getTextInputValue('serverIP'),
                port: portNumber,
                game: interaction.fields.getTextInputValue('game'),
                password: interaction.fields.getTextInputValue('password'),
                modset: interaction.fields.getTextInputValue('modset'),
                channelId: message.channel.id,
                embedId: message.id,
            };

            await databaseService.saveServerInfo(serverInfo);

            const serverMonitoringService: ServerMonitoringService =
                ServerMonitoringService.getInstance();
            await serverMonitoringService.start();
        }
    },
};
