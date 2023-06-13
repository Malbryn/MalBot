import { Client, StringSelectMenuInteraction } from 'discord.js';

export interface SelectMenu {
    data: { name: string };
    run: (
        client: Client,
        interaction: StringSelectMenuInteraction
    ) => Promise<void>;
}
