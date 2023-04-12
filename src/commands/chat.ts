import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { discord_ask } from '../utils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('和chatgpt聊天')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask chatgpt')
                .setRequired(true)),
    scope: "guild",
    no_defer: true,
    async execute(interaction: CommandInteraction) {

        const question = (interaction.options.get("question")?.value ?? "") as string
        const response = await interaction.deferReply();

        await discord_ask(interaction.channel, interaction.user.id, question, response)
    },
};