import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('check if chapt robot is working'),
    scope: "application",
    async execute(interaction: CommandInteraction) {
        await interaction.reply('working!');
    },
};