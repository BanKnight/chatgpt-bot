import { SlashCommandBuilder, MessageComponentInteraction, EmbedBuilder } from 'discord.js';
import { discord_ask } from '../utils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reask')
        .setDescription('reask your question'),
    async execute(interaction: MessageComponentInteraction, options: Record<string, any>) {

        const question = options.question as string
        const userid = options.user as string

        if (question == null || question.length == 0 || userid == null) {
            throw new Error(`question is empty`)
        }

        const message = interaction.message

        await discord_ask(interaction.channel, options.user, question, message)
    },
};
