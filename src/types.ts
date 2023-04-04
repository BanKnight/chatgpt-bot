import { Collection, ApplicationCommandData } from "discord.js"

export interface Command {
    data: ApplicationCommandData;
    scope?: string;
}

declare module "discord.js"
{
    interface Client<> {
        commands: Collection<string, Command>,
    }
}