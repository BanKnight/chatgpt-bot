import { Events, Message, ChannelType, AttachmentBuilder, EmbedBuilder } from "discord.js"
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
    const response = await message.channel.send("Thinking...")

    let answered = false
    beautiful_wait(response, () => answered)

    try {
        const answer = await ask(question, scope_id)

        answered = true

        if (answer.length <= 1900) {
            await response.edit(answer)
            return
        }

        const attachment = new AttachmentBuilder(Buffer.from(answer, 'utf-8'), { name: 'response.txt' });

        await response.edit({ files: [attachment] })
    }
    catch (e) {
        answered = true
        console.error(e)

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("Error")
            .setDescription(e.toString())

        await response.edit({ embeds: [embed] });
    }
}