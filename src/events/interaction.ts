import { Events, CommandInteraction } from "discord.js"

export default {
    name: Events.InteractionCreate,
    async execute(interaction: CommandInteraction) {

        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client
        const command = client.commands.get(interaction.commandName) as any;

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};