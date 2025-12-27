import { Player, useMainPlayer } from 'discord-player';
import {
    ActivityType,
    AnySelectMenuInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    GatewayIntentBits,
    Guild,
    Interaction,
    InteractionType,
    ModalSubmitInteraction,
    REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import * as process from 'node:process';
import { Command } from './components/commands/command';
import { COMMAND_MAP } from './components/commands/command-map';
import { Modal } from './components/modals/modal';
import { MODAL_MAP } from './components/modals/modal-map';
import { SelectMenu } from './components/select_menus/select-menu';
import { SELECT_MENU_MAP } from './components/select_menus/select-menu-map';
import { environment, logger, version } from './globals';
import {
    ConfigService,
    DatabaseService,
    ServerMonitoringService,
} from './services';
import { retry } from './utils';
import { YoutubeSabrExtractor } from 'discord-player-googlevideo';
import { DefaultExtractors } from '@discord-player/extractor';

export class App {
    static client: Client;

    private _configService: ConfigService = ConfigService.getInstance();

    constructor() {
        logger.info(
            `Creating app [Env: ${environment}] [Version: ${version}] [Guild ID: ${this._configService.get('client').guildId}]`,
        );
    }

    async start(): Promise<void> {
        logger.info('Starting bot');

        this.initClient();
        this.initEventListeners();
        await this.initMusicPlayer();

        const discordToken = this._configService.get('client').discordToken;
        const retryCount = this._configService.get('client').loginRetry.count;
        const retryIntervalMs =
            this._configService.get('client').loginRetry.intervalMs;

        await retry(
            async () => await App.client.login(discordToken),
            retryCount,
            retryIntervalMs,
        )
            .then(() => logger.info('Login successful'))
            .catch((error) => {
                logger.error(
                    `Failed to log in after (${this._configService.get('client').loginRetry.count}) attempts: ${error.message}`,
                );

                this.shutdown();
            });
    }

    private initClient(): void {
        logger.info('Initialising client');

        App.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
            ],
            presence: {
                activities: [
                    {
                        name: this._configService.get('client').activityName,
                        type: ActivityType.Watching,
                    },
                ],
            },
        });
    }

    private initEventListeners(): void {
        logger.info('Initialising event listeners');

        App.client
            .once(Events.ClientReady, async () => await this.onClientReady())
            .on(
                Events.InteractionCreate,
                async (interaction) => await this.onInteraction(interaction),
            )
            .on(Events.Error, (error) =>
                logger.error(`Interaction failed: ${error.message}`),
            );
    }

    private async initMusicPlayer(): Promise<void> {
        logger.info('Initialising music player');

        const player: Player = new Player(App.client, {});

        await player.extractors.register(YoutubeSabrExtractor, {});
        await player.extractors.loadMulti([
            ...DefaultExtractors,
            YoutubeSabrExtractor,
        ]);
    }

    private async initServices(): Promise<void> {
        logger.info('Initialising services');

        const databaseService: DatabaseService = DatabaseService.getInstance();
        await databaseService.init();

        const serverMonitoringService: ServerMonitoringService =
            ServerMonitoringService.getInstance();
        await serverMonitoringService.init();
    }

    private async registerCommands(): Promise<void> {
        logger.info('Registering commands');

        const rest: REST = new REST({ version: '10' }).setToken(
            this._configService.get('client').discordToken,
        );
        const commands: Command[] = Array.from(COMMAND_MAP.values());
        const commandJsonBodies: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
            commands
                .map((command) => command.getSlashCommandBuilderJson())
                .filter((commandJson) => commandJson !== undefined);

        await rest.put(
            Routes.applicationGuildCommands(
                this._configService.get('client').clientId,
                this._configService.get('client').guildId,
            ),
            { body: commandJsonBodies },
        );
    }

    private async onClientReady(): Promise<void> {
        await this.registerCommands();
        await this.initServices();

        logger.info(`${App.client.user?.username} is online`);
    }

    private async onInteraction(interaction: Interaction): Promise<void> {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                await this.handleCommandInteraction(interaction);
                break;
            }
            case InteractionType.ModalSubmit: {
                await this.handleModalSubmitInteraction(interaction);
                break;
            }
            case InteractionType.MessageComponent: {
                await this.handleMessageComponentInteraction(interaction);
                break;
            }
            default: {
                logger.error(
                    `Unsupported interaction type: ${interaction.type}`,
                );
            }
        }
    }

    private async handleCommandInteraction(
        interaction: CommandInteraction,
    ): Promise<void> {
        const command: Command | undefined = COMMAND_MAP.get(
            interaction.commandName,
        );

        if (!command) {
            logger.error(`Command is not found: ${interaction.commandName}`);
            return;
        }

        logger.debug(
            `Handling command [Command: ${interaction.commandName}] [Requested by: ${interaction.member?.user.username}]`,
        );

        await interaction.deferReply();

        const player: Player = useMainPlayer();
        const guild: Guild | null = interaction.guild;

        if (!guild) {
            logger.warn(`Cannot provide Guild to player context`);

            await command.execute(interaction);
            return;
        }

        await player.context.provide({ guild }, () =>
            command.execute(interaction),
        );
    }

    private async handleModalSubmitInteraction(
        interaction: ModalSubmitInteraction,
    ): Promise<void> {
        const modal: Modal | undefined = MODAL_MAP.get(interaction.customId);

        if (!modal) {
            logger.error(`Modal is not found: ${interaction.customId}`);
            return;
        }

        logger.debug(
            `Handling modal [Modal: ${interaction.customId}] [Requested by: ${interaction.member?.user.username}]`,
        );

        await interaction.deferReply();
        await modal.execute(interaction);
    }

    private async handleMessageComponentInteraction(
        interaction: AnySelectMenuInteraction | ButtonInteraction,
    ): Promise<void> {
        if (interaction instanceof ButtonInteraction) {
            return;
        }

        const selectMenu: SelectMenu | undefined = SELECT_MENU_MAP.get(
            interaction.customId,
        );

        if (!selectMenu) {
            logger.error(`Select menu is not found: ${interaction.customId}`);
            return;
        }

        logger.debug(
            `Handling select menu [Select menu: ${interaction.customId}] [Requested by: ${interaction.member?.user.username}]`,
        );

        await selectMenu.execute(interaction);
    }

    private shutdown(code: number = 1): void {
        logger.warn(`Shutting down app [Code: ${code}]`);

        process.exit(code);
    }
}
