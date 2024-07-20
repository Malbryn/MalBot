import { EmbedBuilder } from '@discordjs/builders';
import { Message, ModalSubmitInteraction } from 'discord.js';
import { Modal } from '../modal';
import { DatabaseService } from '../../../services/database.service';
import { ServerMonitoringService } from '../../../services/server-monitoring.service';
import { embedColours } from '../../../config/config';
import { logger } from '../../../index';
import { ServerInfo } from '../../../types/server-info.type';

export class CreateServerMonitorModal extends Modal {
    static readonly NAME: string = 'create_server_modal';
    private static instance: CreateServerMonitorModal;

    private databaseService: DatabaseService = DatabaseService.getInstance();
    private serverMonitoringService: ServerMonitoringService =
        ServerMonitoringService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): CreateServerMonitorModal {
        if (!CreateServerMonitorModal.instance) {
            CreateServerMonitorModal.instance = new CreateServerMonitorModal();
        }

        return CreateServerMonitorModal.instance;
    }

    override async execute(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.reply('Creating new server info panel...');

        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder
            .setTitle('Server Info')
            .setColor(embedColours.WARNING)
            .setDescription('```⌛ Fetching server data...```');

        await interaction.deleteReply();
        await this.handleModal(interaction, embedBuilder);
    }

    protected async handleModal(
        interaction: ModalSubmitInteraction,
        embedBuilder: EmbedBuilder,
    ): Promise<void> {
        if (!interaction.channel) {
            logger.error(
                `Cannot handle modal because the channel is not found`,
            );
            return;
        }

        const message: Message = await interaction.channel.send({
            embeds: [embedBuilder],
        });

        if (!this.serverMonitoringService.pendingGame) {
            logger.error('Pending game is undefined');
            return;
        }

        const serverInfo: ServerInfo = {
            id: 1,
            ip: interaction.fields.getTextInputValue('serverIP'),
            gamePort: Number.parseInt(
                interaction.fields.getTextInputValue('gamePort'),
            ),
            queryPort: Number.parseInt(
                interaction.fields.getTextInputValue('queryPort'),
            ),
            game: this.serverMonitoringService.pendingGame,
            password: interaction.fields.getTextInputValue('password'),
            modset: interaction.fields.getTextInputValue('modset'),
            channelId: message.channel.id,
            embedId: message.id,
            isRunning: true,
        };

        await this.databaseService.saveServerInfo(serverInfo);
        this.serverMonitoringService.resetPendingGame();

        if (this.serverMonitoringService.isRunning()) {
            await this.serverMonitoringService.stop();
        }

        await this.serverMonitoringService.start();
    }
}
