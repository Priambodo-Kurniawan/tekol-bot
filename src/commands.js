require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')
const jobBuild = require('./jenkins').jobBuild
const getLastBuildStatus = require('./jenkins').getLastBuildStatus
const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const job_dev_ss = process.env.JOB_SS_NAME

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

    if (job_name === 'dev_ss') {
        getLastBuildStatus(bot, chat_id, job_dev_ss)
    } else {
        bot.sendMessage(chat_id, 'Job nya ga ada, typo ga tuh?')
    }
})