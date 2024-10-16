import { ModalSubmitInteraction, RGBTuple } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { embedColours } from '../../config/config';

export abstract class Modal {
    public abstract execute(interaction: ModalSubmitInteraction): Promise<void>;

    protected async sendSimpleReply(
        interaction: ModalSubmitInteraction,
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
