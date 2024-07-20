import { ActionRowBuilder } from '@discordjs/builders';
import {
    AnyComponentBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Command } from '../command';
import { config } from '../../../config/config';
import { Game } from '../../../types/config.type';

export class CreateServerMonitorCommand extends Command {
    static readonly NAME: string = 'create_server_info_panel';
    private static instance: CreateServerMonitorCommand;

    private constructor() {
        super();
    }

    public static getInstance(): CreateServerMonitorCommand {
        if (!CreateServerMonitorCommand.instance) {
            CreateServerMonitorCommand.instance =
                new CreateServerMonitorCommand();
        }

        return CreateServerMonitorCommand.instance;
    }

    protected override initBuilder(): void {
        if (this.slashCommandBuilder) return;

        this.slashCommandBuilder = new SlashCommandBuilder()
            .setName(CreateServerMonitorCommand.NAME)
            .setDescription('Creates the server info panel.');
    }

    override async execute(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const selectMenu: StringSelectMenuBuilder =
            new StringSelectMenuBuilder()
                .setCustomId('server_monitor_select_menu')
                .setPlaceholder('Select a game')
                .setMinValues(1)
                .setMaxValues(1);

        const gameOptions: Game[] = [...config.SERVER_MONITORING_GAMES];

        for (const gameOption of gameOptions) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(gameOption.name)
                    .setValue(gameOption.id),
            );
        }

        const actionRow: ActionRowBuilder<AnyComponentBuilder> =
            new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Select a game',
            // @ts-ignore
            components: [actionRow],
        });
    }
}
