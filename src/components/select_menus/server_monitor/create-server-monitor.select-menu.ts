import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from '@discordjs/builders';
import {
    MessageInteractionMetadata,
    StringSelectMenuInteraction,
    TextInputStyle,
} from 'discord.js';
import { logger } from '../../../globals';
import { ServerMonitoringService } from '../../../services';
import { SelectMenu } from '../select-menu';

export class CreateServerMonitorSelectMenu extends SelectMenu {
    static readonly NAME: string = 'server_monitor_select_menu';

    private static instance: CreateServerMonitorSelectMenu;

    private _serverMonitoringService: ServerMonitoringService =
        ServerMonitoringService.getInstance();

    private constructor() {
        super();
    }

    public static getInstance(): CreateServerMonitorSelectMenu {
        if (!CreateServerMonitorSelectMenu.instance) {
            CreateServerMonitorSelectMenu.instance =
                new CreateServerMonitorSelectMenu();
        }

        return CreateServerMonitorSelectMenu.instance;
    }

    override async execute(
        interaction: StringSelectMenuInteraction,
    ): Promise<void> {
        const metadata: MessageInteractionMetadata | null =
            interaction.message.interactionMetadata;

        if (!metadata) {
            logger.warn('Message interaction metadata is not found');
            return;
        }

        if (interaction.user.id !== metadata.user.id) {
            logger.warn(
                `Select menu user mismatch [Interaction owner: ${metadata.user.username}] [Interacting user: ${interaction.user.username}]`,
            );
            return;
        }

        const modal: ModalBuilder = this.createModal();
        this._serverMonitoringService.pendingGame =
            interaction.values[0] ?? undefined;

        await interaction.showModal(modal);
        await interaction.message.delete();
    }

    protected createModal(): ModalBuilder {
        const modal: ModalBuilder = new ModalBuilder()
            .setCustomId('create_server_modal')
            .setTitle('Create new server info panel');

        const ip: TextInputBuilder = new TextInputBuilder()
            .setCustomId('serverIP')
            .setLabel('IP')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Server IP')
            .setMinLength(7)
            .setMaxLength(15)
            .setRequired(true);

        const gamePort: TextInputBuilder = new TextInputBuilder()
            .setCustomId('gamePort')
            .setLabel('Game port')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Game port')
            .setMinLength(4)
            .setMaxLength(5)
            .setRequired(true);

        const queryPort: TextInputBuilder = new TextInputBuilder()
            .setCustomId('queryPort')
            .setLabel('Query port (Optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Query port')
            .setMinLength(4)
            .setMaxLength(5)
            .setRequired(false);

        const modset: TextInputBuilder = new TextInputBuilder()
            .setCustomId('modset')
            .setLabel('Modset link (Optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Link to modset')
            .setRequired(false);

        const password: TextInputBuilder = new TextInputBuilder()
            .setCustomId('password')
            .setLabel('Server password (Optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Server password')
            .setRequired(false);

        const ipAction: ActionRowBuilder<TextInputBuilder> =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                ip,
            );
        const gamePortAction: ActionRowBuilder<TextInputBuilder> =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                gamePort,
            );
        const queryPortAction: ActionRowBuilder<TextInputBuilder> =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                queryPort,
            );
        const modsetAction: ActionRowBuilder<TextInputBuilder> =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                modset,
            );
        const passwordAction: ActionRowBuilder<TextInputBuilder> =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                password,
            );

        modal.addComponents(
            ipAction,
            gamePortAction,
            queryPortAction,
            modsetAction,
            passwordAction,
        );

        return modal;
    }
}
