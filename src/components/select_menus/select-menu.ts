import { EmbedBuilder } from '@discordjs/builders';
import {
    AnySelectMenuInteraction,
    RGBTuple,
    StringSelectMenuInteraction,
} from 'discord.js';
import { embedColours } from '../../globals';

export abstract class SelectMenu {
    public abstract execute(
        interaction: AnySelectMenuInteraction,
    ): Promise<void>;

    protected async sendSimpleReply(
        interaction: StringSelectMenuInteraction,
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
}
