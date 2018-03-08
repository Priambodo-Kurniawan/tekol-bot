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
    let job_shortname = ''

    switch (job_name) {
        case process.env.JOB_DEV_SS:
            job_shortname = 'dev_ss'
            break;
        
        case process.env.JOB_DEV_CORE:
            job_shortname = 'dev_core'
            break
        
        case process.env.JOB_DEV_NEO:
            job_shortname = 'dev_neo'
            break
    
        default:
            break;
    }

    jenkins.job.build({
        name: job_name,
        parameters: {
            REVISION: branch
        }
    }, (err) => {
        if (err) throw err

        let response_message = `Build on progress...\n`
            response_message += `Silakan cek command /status ${job_shortname}`

        bot.sendMessage(chat_id, response_message)
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
        const build_on_queue = data.building
        const build_branch = data.actions[0].parameters[0].value
        const build_user = data.actions[1].causes[0].userName
        const build_time_spent = convertMs(data.duration)
        const build_time_raw = new Date(data.timestamp)
        const build_time = dateformat(build_time_raw, 'mmmm dd, yyyy HH:MM')

        let build_result = data.result
        let emoji_status = ''
        let build_estimate = convertMs(data.estimatedDuration)

        if (build_on_queue) {
            build_result = 'Building'
            emoji_status = emoji.get('gear')
        } else {
            if (build_result == 'SUCCESS') {
                emoji_status = emoji.get('white_check_mark')
            } else {
                emoji_status = emoji.get('x')
            }
        }

        let response_message = `<b>Build Status</b>\n`
            response_message += `============\n`
            response_message += `ID: ${build_target}\n`
            response_message += `Host: ${zone}\n`
            response_message += `Status: ${build_result} ${emoji_status}\n`
            response_message += `Branch: ${build_branch}\n`
            response_message += `User: ${build_user}\n`

            if (build_on_queue) {
                response_message += `Estimated: ${build_estimate} Min\n`
            } else {
                response_message += `Duration: ${build_time_spent} Min\n`
            }

            response_message += `Date: ${build_time}`
        
        
        bot.sendMessage(chat_id, response_message, { parse_mode: 'HTML' })
    })
}

module.exports.jobBuild = jobBuild
module.exports.getLastBuildStatus = getLastBuildStatus

// --------- //
// Debugging //
// --------- //