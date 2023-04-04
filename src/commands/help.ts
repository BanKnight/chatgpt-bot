import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ChatInputApplicationCommandData } from 'discord.js';
import config from "../config.js"

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('打印所有支持的指令'),
    scope: "application",
    async execute(interaction: CommandInteraction) {

        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor(0x00FFF0)
            .setTitle("帮助")
            .setDescription(`所有命令如下`)

        for (const [name, command] of interaction.client.commands) {
            if (command.scope == null) {
                continue
            }

            if (command.scope == "guild" && !config.SERVERS.includes(interaction.guildId)) {
                continue
            }

            const data = command.data as ChatInputApplicationCommandData

            embed.addFields({ name: `/${name}`, value: data.description })
        }

        await interaction.editReply({ embeds: [embed] });
    },
};