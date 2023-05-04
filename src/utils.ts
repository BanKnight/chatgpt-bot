import { ChatGPTAPI } from "chatgpt"
import config from "./config.js"
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Channel, EmbedBuilder, InteractionResponse, Message, TextBasedChannel, User } from "discord.js"

export function wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function beautiful_wait(message, until_cond) {
    let start = Date.now()
    let timer = setInterval(() => {
        if (until_cond()) {
            clearInterval(timer)
        }
        else {
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setFooter({ text: `${(Date.now() - start) / 1000} s` })

            message.edit({ embeds: [embed] });
        }
    }, 1000)
}

const scopes = {}         //[guildId][channelId][user.id] = last_messageid
const api = new ChatGPTAPI({
    apiKey: config.CHATGPT
})

export async function ask(question: string, scope_id: string, options = {}) {
    let last_info = null

    if (scope_id) {
        last_info = scopes[scope_id]
    }

    if (last_info && last_info.expired < Date.now()) {
        last_info = scopes[scope_id] = null
    }

    const res = await api.sendMessage(question, {
        ...options,
        parentMessageId: last_info?.id,
        timeoutMs: 1000 * 60 * 5,
    })

    if (scope_id) {
        scopes[scope_id] = {
            id: res.id,
            expired: Date.now() + 60 * 60 * 1000
        }
    }

    return res.text
}

export async function discord_ask(channel: TextBasedChannel, userid: string, question: string, response: InteractionResponse | Message) {

    const scope_id = `${channel.id}/${userid}`

    const embed = new EmbedBuilder()
        .setColor(0x909399)
        .setDescription(question)

    const row = new ActionRowBuilder<ButtonBuilder>()

    row.addComponents(new ButtonBuilder()
        .setCustomId(JSON.stringify({ name: "reask", user: userid }))
        .setLabel("再答一次")
        .setStyle(ButtonStyle.Primary),
    )

    let answered = false
    let start = Date.now()

    try {

        let answer: string = null
        let working = false

        let count = -1
        let timer = setInterval(async () => {
            if (answered) {
                clearInterval(timer)
                return
            }
            count++
            embed.setFooter({ text: `${(Date.now() - start) / 1000} s` })

            if (answer == null || answer.length == 0) {
                channel.sendTyping()
                await response.edit({ embeds: [embed] });
                return
            }

            if (working) {
                return
            }

            if (count % 10 == 0) {
                channel.sendTyping()
            }

            working = true

            if (answer.length <= 1900) {
                await response.edit({ content: `${answer}\`\`\``, embeds: [embed] });
            }

            working = false

        }, 1000)

        await response.edit({ content: "思考中...", embeds: [embed], components: [], files: [], });

        answer = await ask(question, scope_id, {
            async onProgress(resp: any) {
                answer = resp.text
            }
        })
        answered = true

        embed.setColor(0x67C23A)
        embed.setFooter({ text: `${(Date.now() - start) / 1000} s` })

        row.addComponents(new ButtonBuilder()
            .setCustomId(JSON.stringify({ name: "more", user: userid }))
            .setLabel("更多回答")
            .setStyle(ButtonStyle.Secondary),
        )

        if (answer.length <= 1900) {
            await response.edit({ content: answer, embeds: [embed], components: [row] });
            return
        }

        const attachment = new AttachmentBuilder(Buffer.from(answer, 'utf-8'), { name: 'response.md' });

        await response.edit({ files: [attachment], embeds: [embed], components: [row] });
    }
    catch (e) {
        answered = true
        console.error(e)

        embed.setColor(0xF56C6C)
            .setTitle("报错")
            .setDescription(`${e}`)

        await response.edit({ content: `${e}`, embeds: [embed], components: [row] });
    }
}
