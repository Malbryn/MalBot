import { EmbedBuilder } from '@discordjs/builders';
import { Client, Message, ModalSubmitInteraction } from 'discord.js';
import { embedColours } from '../../config/config';
import { Modal } from '../../interfaces/Modal';
import { ServerInfo } from '../../interfaces/ServerInfo';
import { databaseService, serverMonitoringService } from '../../main';

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
            .setColor(embedColours.YELLOW)
            .setDescription('```Fetching data...```');

        await interaction.deleteReply();
        const message: Message | undefined = await interaction.channel?.send({
            embeds: [embedBuilder],
        });

        if (message) {
            const portNumber: number = Number.parseInt(
                interaction.fields.getTextInputValue('serverPort')
            );

            const serverInfo: ServerInfo = {
                id: 1,
                ip: interaction.fields.getTextInputValue('serverIP'),
                port: portNumber,
                game: interaction.fields.getTextInputValue('game'),
                password: interaction.fields.getTextInputValue('password'),
                modset: interaction.fields.getTextInputValue('modset'),
                channelId: message.channel.id,
                embedId: message.id,
            };

            await databaseService.saveServerInfo(serverInfo);

            if (serverMonitoringService.isRunning())
                serverMonitoringService.stop();

            await serverMonitoringService.start();
        }
    },
};
