import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { beautiful_wait, ask } from '../utils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('chat to chatgpt')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask chatgpt')
                .setRequired(true)),
    scope: "guild",
    async execute(interaction: CommandInteraction) {

        const question = (interaction.options.get("question")?.value ?? "") as string
        const scope_id = `${interaction.guildId ?? "@me"}/${interaction.channelId}/${interaction.user.id}`

        const response = await interaction.deferReply();

        let stop = false

        beautiful_wait(response, () => stop)

        try {
            const answer = await ask(question, scope_id)

            stop = true

            if (answer.length <= 1900) {
                await response.edit(`> **${question}** - <@${interaction.user.id}> \n\n ${answer}`)
                return
            }

            const attachment = new AttachmentBuilder(Buffer.from(answer, 'utf-8'), { name: 'response.txt' });

            await response.edit({ files: [attachment], content: `> **${question}** - <@${interaction.user.id}>` })
        }
        catch (e) {
            stop = true
            console.error(e)

            const result = `> **${question}** - <@${interaction.user.id}> \n\n ${e}`
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription(result)

            await response.edit({ embeds: [embed] });
        }
    },
};