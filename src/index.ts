import { resolve, join, dirname } from "path"
import { readdirSync } from "fs"
import { fileURLToPath, pathToFileURL } from "url"
import { Client, Collection, GatewayIntentBits, Partials, REST, Routes } from "discord.js"

import config from "./config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

{   //commands
    const commandsPath = resolve(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = pathToFileURL(join(commandsPath, file)).toString();
        const { default: command } = await import(filePath)
        client.commands.set(command.data.name, command);
    }
}

{   //eventsPath
    const eventsPath = resolve(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = pathToFileURL(join(eventsPath, file)).toString();
        const { default: event } = await import(filePath)

        if (event.once) {
            client.once(event.name, (...args: any[]) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args: any[]) => event.execute(...args));
        }
    }
}

client.login(config.TOKEN);