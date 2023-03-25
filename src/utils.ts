import { ChatGPTAPI } from "chatgpt"
import config from "./config.js"

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
            message.edit(`Thinking ... ${(Date.now() - start) / 1000} s`)
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
        timeoutMs: 60000,
    })

    if (scope_id) {
        scopes[scope_id] = {
            id: res.id,
            expired: Date.now() + 60 * 60 * 1000
        }
    }

    return res.text
}
