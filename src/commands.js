require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')
const jobBuild = require('./jenkinsCI').jobBuild
const getLastBuildStatus = require('./jenkinsCI').getLastBuildStatus
const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const job_dev_ss = process.env.JOB_DEV_SS
const job_dev_core = process.env.JOB_DEV_CORE
const job_dev_neo = process.env.JOB_DEV_NEO

/**
 * listen /start command
 */
bot.onText(/\/start/, (msg) => {
    const chat_id = msg.chat.id

    let response_message = `Halo paduka, cekidot /help ya kalau lupa..`

    bot.sendMessage(chat_id, response_message)
})

/**
 * listen /build dev_ss [branch] command
 */
bot.onText(/\/build dev_ss (.+)/, (msg, match) => {
    const chat_id = msg.chat.id
    const branch = match[1]

    if (branch) {
        jobBuild(bot, chat_id, job_dev_ss, branch)
    }
})

/**
 * listen /build dev_core [branch] command
 */
bot.onText(/\/build dev_core (.+)/, (msg, match) => {
    const chat_id = msg.chat.id
    const branch = match[1]

    if (branch) {
        jobBuild(bot, chat_id, job_dev_core, branch)
    }
})

/**
 * listen /status [job] command
 */
bot.onText(/\/status (.+)/, (msg, match) => {
    const chat_id = msg.chat.id
    const job_name = match[1]
    let zone = ''

    switch (job_name) {
        case 'dev_ss':
            zone = process.env.ZONE_DEV_SS
            getLastBuildStatus(bot, chat_id, job_dev_ss, zone)
            break
        case 'dev_core':
            zone = process.env.ZONE_DEV_CORE
            getLastBuildStatus(bot, chat_id, job_dev_core, zone)
            break
        case 'dev_neo':
            zone = process.env.ZONE_DEV_NEO
            getLastBuildStatus(bot, chat_id, job_dev_neo, zone)
            break
        default:
            bot.sendMessage(chat_id, 'Job nya ga ada, typo ga tuh?')
    }
})

/**
 * listen /help command
 */
bot.onText(/\/help/, (msg) => {
    const chat_id = msg.chat.id

    let response_message = `Available commands:\n`
        response_message += `/build - trigger build\n`
        response_message += `/status - check last build status\n`
        response_message += `/jobs - list available jobs\n\n`
        response_message += `Usage:\n`
        response_message += `/build <job> <branch>\n`
        response_message += `/status <job>`
    
    bot.sendMessage(chat_id, response_message)
})

/**
 * listen /jobs command
 */
bot.onText(/\/jobs/, (msg) => {
    const chat_id = msg.chat.id

    let response_message = `Available jobs:\n`
        response_message += `dev_core\n`
        response_message += `dev_ss\n`
        response_message += `dev_neo`
    
    bot.sendMessage(chat_id, response_message)
})