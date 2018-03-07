require('dotenv').config()

const emoji = require('node-emoji')
const dateformat = require('dateformat')
const convertMs = require('./helper').convertMs

const jenkins = require('jenkins')({
    baseUrl: process.env.JENKINS_PROTOCOL + process.env.JENKINS_USERNAME + ':' + process.env.JENKINS_API_TOKEN + '@' + process.env.JENKINS_HOST,
    crumbIssuer: true
});

/**
 * Jenkins job remote builder
 * @param {Object} bot bot instance
 * @param {Number} chat_id sender chat id
 * @param {String} job_name jenkins job name
 * @param {String} branch git branch
 */
const jobBuild = (bot, chat_id, job_name, branch) => {
    jenkins.job.build({
        name: job_name,
        parameters: {
            REVISION: branch
        }
    }, (err) => {
        if (err) throw err

        bot.sendMessage(chat_id, 'Build on progress...')
    })
}

/**
 * Retrieve jenkins job information
 * @param {Object} bot bot instance
 * @param {Number} chat_id sender chat id
 * @param {String} job_name jenkins job name
 * @param {String} zone environment zone
 */
const getLastBuildStatus = (bot, chat_id, job_name, zone) => {
    jenkins.job.get(job_name, (err, data) => {
        if (err) throw err
        const build_number = data.builds[0].number

        jobBuildStatus(bot, chat_id, job_name, build_number, zone)
    })
}

/**
 * Jenkins job build status checker
 * @param {Object} bot bot instance
 * @param {Number} chat_id sender chat id
 * @param {String} job_name jenkins job name
 * @param {Number} build_number jenkins build number
 * @param {String} zone environment zone
 */
const jobBuildStatus = (bot, chat_id, job_name, build_number, zone) => {
    jenkins.build.get(job_name, build_number, (err, data) => {
        if (err) throw err

        const build_target = data.fullDisplayName
        const build_result = data.result
        const build_branch = data.actions[0].parameters[0].value
        const build_user = data.actions[1].causes[0].userName
        const build_time_spent = convertMs(data.duration)
        const build_time_raw = new Date(data.timestamp)
        const build_time = dateformat(build_time_raw, 'mmmm dd, yyyy HH:MM')

        let emoji_status = ''

        if (build_result == 'SUCCESS') {
            emoji_status = emoji.get('white_check_mark')
        } else {
            emoji_status = emoji.get('x')
        }

        let response_message = `<b>Build Status</b>\n`
            response_message += `============\n`
            response_message += `ID: ${build_target}\n`
            response_message += `Zone: ${zone}\n`
            response_message += `Status: ${build_result} ${emoji_status}\n`
            response_message += `Branch: ${build_branch}\n`
            response_message += `User: ${build_user}\n`
            response_message += `Duration: ${build_time_spent}\n`
            response_message += `Date: ${build_time}`
        
        
        bot.sendMessage(chat_id, response_message, { parse_mode: 'HTML' })
    })
}

module.exports.jobBuild = jobBuild
module.exports.getLastBuildStatus = getLastBuildStatus

// --------- //
// Debugging //
// --------- //