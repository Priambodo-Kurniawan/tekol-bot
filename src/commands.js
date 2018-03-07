require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')
const jobBuild = require('./jenkins').jobBuild
const getLastBuildStatus = require('./jenkins').getLastBuildStatus
const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const job_dev_ss = process.env.JOB_DEV_CORE_NAME
const job_dev_core = process.env.JOB_DEV_CORE_NAME

/**
 * listen /build dev_ss [branch] command
 */
bot.onText(/\/build dev_ss (.+)/, (msg, match) => {
    const chat_id = msg.chat.id
    const branch = match[1]

    // validate branch
    if (branch) {
        jobBuild(job_dev_ss, branch)
        bot.sendMessage(chat_id, branch)
    } else {
        bot.sendMessage(chat_id, 'Target branch harus di isi')
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
        default:
            bot.sendMessage(chat_id, 'Job nya ga ada, typo ga tuh?')
    }
})