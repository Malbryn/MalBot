import { Client, CommandInteraction, Interaction } from 'discord.js';
import { commands } from '../commands';

export default (client: Client): void => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }
    });
};

const handleSlashCommand = async (
    client: Client,
    interaction: CommandInteraction
): Promise<void> => {
    const slashCommand = commands.find(
        (command) => command.name === interaction.commandName
    );

    if (!slashCommand) {
        interaction.followUp({ content: 'An error has occured' });
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};
