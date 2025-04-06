import { EmbedBuilder } from '@discordjs/builders';
import {
    GuildTextBasedChannel,
    Message,
    ModalSubmitInteraction,
    TextBasedChannel,
} from 'discord.js';
import { embedColours, logger } from '../../../globals';
import { DatabaseService, ServerMonitoringService } from '../../../services';
import { ServerInfo } from '../../../types';
import { Modal } from '../modal';

export class CreateServerMonitorModal extends Modal {
    static readonly NAME: string = 'create_server_modal';

    private static instance: CreateServerMonitorModal;

    private _databaseService: DatabaseService = DatabaseService.getInstance();
    private _serverMonitoringService: ServerMonitoringService =
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
        await this.sendSimpleReply(
            interaction,
            'Creating new server info panel...',
        );

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

        const channel: TextBasedChannel =
            interaction.channel as GuildTextBasedChannel;
        const message: Message = await channel.send({
            embeds: [embedBuilder],
        });

        if (!this._serverMonitoringService.pendingGame) {
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
            game: this._serverMonitoringService.pendingGame,
            password: interaction.fields.getTextInputValue('password'),
            modset: interaction.fields.getTextInputValue('modset'),
            channelId: message.channel.id,
            embedId: message.id,
            isRunning: true,
        };

        await this._databaseService.saveServerInfo(serverInfo);
        this._serverMonitoringService.resetPendingGame();

        if (this._serverMonitoringService.isRunning()) {
            await this._serverMonitoringService.stop();
        }

        await this._serverMonitoringService.start();
    }
}
