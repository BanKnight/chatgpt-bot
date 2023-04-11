import { Events, Message, ChannelType, AttachmentBuilder, EmbedBuilder, TextBasedChannelFields } from "discord.js"
import { beautiful_wait, ask } from "../utils.js";

export default {
    name: Events.MessageCreate,
    async execute(message: Message) {

        if (message.author.bot) {
            return
        }

        const content = message.content

        if (message.author == message.client.user) {
            return
        }

        if (message.channel.type == ChannelType.DM) {
            return await on_dm(message)
        }
    },
};


async function on_dm(message: Message) {

    const user = message.author
    const question = message.content

    const scope_id = user.id

    message.channel.sendTyping()

    const response = await message.channel.send("Thinking...")
    const embed = new EmbedBuilder()

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

            message.channel.sendTyping()

            working = true

            if (answer.length <= 1900) {
                await response.edit({ content: `${answer}\`\`\``, embeds: [embed] })
            }

            working = false

        }, 1000)

        answer = await ask(question, scope_id, {
            name: user.username,
            async onProgress(resp: any) {
                answer = resp.text
            }
        })

        answered = true

        embed.setColor(0x0000FF)
        embed.setFooter({ text: `done:${(Date.now() - start) / 1000} s` })

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
            .setDescription(e.toString())

        await response.edit({ embeds: [embed] });
    }
}