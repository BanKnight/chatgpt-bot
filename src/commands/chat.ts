import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { beautiful_wait, ask } from '../utils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('和chatgpt聊天')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask chatgpt')
                .setRequired(true)),
    scope: "guild",
    async execute(interaction: CommandInteraction) {

        const question = (interaction.options.get("question")?.value ?? "") as string
        const scope_id = `${interaction.guildId ?? "@me"}/${interaction.channelId}/${interaction.user.id}`

        const response = await interaction.deferReply();
        const embed = new EmbedBuilder()
            .setDescription(`${question} - <@${interaction.user.id}>`)

        let answered = false
        let start = Date.now()

        try {

            embed.setColor(0x00FF00)

            let answer: string = null
            let working = false

            let timer = setInterval(async () => {
                if (answered) {
                    clearInterval(timer)
                    return
                }
                embed.setFooter({ text: `${(Date.now() - start) / 1000} s` })

                if (answer == null || answer.length == 0) {
                    await response.edit({ embeds: [embed] })
                    return
                }

                if (working) {
                    return
                }

                interaction.channel.sendTyping()
                working = true

                if (answer.length <= 1900) {
                    await response.edit({ content: `${answer}\`\`\``, embeds: [embed] })
                }

                working = false

            }, 1000)

            answer = await ask(question, scope_id, {
                async onProgress(resp: any) {
                    answer = resp.text
                }
            })
            answered = true

            embed.setColor(0x0000FF)
            embed.setFooter({ text: `${(Date.now() - start) / 1000} s` })

            if (answer.length <= 1900) {
                await response.edit({ content: answer, embeds: [embed] })
                return
            }

            const attachment = new AttachmentBuilder(Buffer.from(answer, 'utf-8'), { name: 'response.txt' });

            await response.edit({ files: [attachment], embeds: [embed] })
        }
        catch (e) {
            answered = true
            console.error(e)

            embed.setColor(0xFF0000)
                .setDescription(`${e}`)

            await response.edit({ embeds: [embed] });
        }
    },
};