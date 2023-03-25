import { resolve } from "path";
import { config } from "dotenv";

// Parsing the env file.
const node_env = process.env.NODE_ENV || "production"
console.log("env is", node_env)
const file = resolve(`./.env.${node_env}`)

const output = config({ path: file });
if (output.error) {
    console.error(output.error)
}

namespace NodeJS {
    interface ProcessEnv {
        TOKEN: string;
        APPLICATION: string;
        CHATGPT: string;
        SERVERS: string
    }
}

interface Config {
    TOKEN: string;
    APPLICATION: string;
    CHATGPT: string;
    SERVERS: string[];
}

export default {
    TOKEN: process.env.TOKEN,
    APPLICATION: process.env.APPLICATION,
    CHATGPT: process.env.CHATGPT,
    SERVERS: process.env.SERVERS.split(","),
} as Config;

