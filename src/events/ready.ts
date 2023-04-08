import { Events, Client } from "discord.js";
import config from "../config.js"

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {

        console.log(`Ready! Logged in as ${client.user.tag}`);

        const exists = await client.application.commands.fetch();
        const current = client.commands

        let total = 0
        for (const [id, command] of exists) {
            let temp = current.get(command.name)
            if (temp && temp.scope == "application") {
                continue
            }
            total++
            command.delete()
        }
        if (total > 0) {
            console.log("application.commands.delete:", total)
        }
        total = 0
        for (const [name, command] of current) {
            if (command.scope != "application") {
                continue
            }
            total++
            await client.application.commands.create(command.data)
        }

        if (total > 0) {
            console.log("application.commands.create:", total)
        }

        for (const serverid of config.SERVERS) {
            const guild = client.guilds.cache.get(serverid);
            const commands = await guild.commands.fetch()

            total = 0
            for (const [id, command] of commands) {
                let temp = current.get(command.name)
                if (temp && temp.scope == "guild") {
                    continue
                }
                total++
                command.delete()
            }
            if (total > 0) {
                console.log(`guild[${serverid}] delete(${total})`)
            }
            total = 0
            for (const [name, command] of current) {
                if (command.scope != "guild") {
                    continue
                }
                total++
                await client.application.commands.create(command.data, serverid)
            }

            if (total > 0) {
                console.log(`guild[${serverid}].commands.create(${total})`)
            }

        }
    },
};
