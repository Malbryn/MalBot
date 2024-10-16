import {
    CommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RGBTuple,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { embedColours } from '../../config/config';

export abstract class Command {
    protected slashCommandBuilder:
        | SlashCommandBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandOptionsOnlyBuilder
        | undefined;

    protected constructor() {
        this.initBuilder();
    }

    protected abstract initBuilder(): void;

    public abstract execute(interaction: CommandInteraction): Promise<void>;

    public getSlashCommandBuilderJson():
        | RESTPostAPIChatInputApplicationCommandsJSONBody
        | undefined {
        return this.slashCommandBuilder?.toJSON();
    }

    protected async sendSimpleReply(
        interaction: CommandInteraction,
        message: string,
        colour: RGBTuple = embedColours.INFO,
    ): Promise<void> {
        const embedBuilder: EmbedBuilder = new EmbedBuilder();

        embedBuilder.setColor(colour).setAuthor({
            name: message,
        });

        const isHandled: boolean = interaction.replied || interaction.deferred;

        isHandled
            ? await interaction.editReply({
                  embeds: [embedBuilder],
              })
            : await interaction.reply({
                  embeds: [embedBuilder],
                  fetchReply: true,
              });
    }

    protected async handleError(
        interaction: CommandInteraction,
        message: string,
    ): Promise<void> {
        const formattedMessage: string = `❌ ${message}`;

        await this.sendSimpleReply(
            interaction,
            formattedMessage,
            embedColours.ERROR,
        );
    }
}
