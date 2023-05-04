import { SlashCommandBuilder, MessageComponentInteraction, EmbedBuilder } from 'discord.js';
import { discord_ask } from '../utils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reask')
        .setDescription('reask your question'),
    async execute(interaction: MessageComponentInteraction, options: Record<string, any>) {

        const userid = options.user as string

        if (userid == null) {
            throw new Error(`question is empty`)
        }

        const message = interaction.message
        const embeds = message.embeds;

        if (embeds.length == 0) {
            throw new Error(`question is empty`)
        }

        const first = embeds[0];

        const question = first.description || first.title || options.question
        if (question == null) {
            throw new Error(`question is empty`)
        }
        await discord_ask(interaction.channel, userid, question, message)
    },
};
