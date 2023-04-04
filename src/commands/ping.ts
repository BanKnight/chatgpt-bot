import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('检查chatgpt机器人是否还在工作中'),
    scope: "application",
    async execute(interaction: CommandInteraction) {
        await interaction.reply('working!');
    },
};