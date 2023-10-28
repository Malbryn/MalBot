import { Client, StringSelectMenuInteraction } from 'discord.js';

export type SelectMenu = {
    data: { name: string };
    run: (
        client: Client,
        interaction: StringSelectMenuInteraction
    ) => Promise<void>;
};
