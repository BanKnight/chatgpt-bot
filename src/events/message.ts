import { Events, Message, ChannelType, AttachmentBuilder, EmbedBuilder, TextBasedChannelFields } from "discord.js"
import { beautiful_wait, ask, discord_ask } from "../utils.js";

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

    message.channel.sendTyping()

    const response = await message.channel.send("Thinking...")

    await discord_ask(message.channel, user.id, question, response)
}