require('dotenv').config()

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
 */
const getLastBuildStatus = (bot, chat_id, job_name) => {
    jenkins.job.get(job_name, (err, data) => {
        if (err) throw err
        const build_number = data.builds[0].number

        jobBuildStatus(bot, chat_id, job_name, build_number)
    })
}

/**
 * Jenkins job build status checker
 * @param {Object} bot bot instance
 * @param {Number} chat_id sender chat id
 * @param {String} job_name jenkins job name
 * @param {Number} build_number jenkins build number
 */
const jobBuildStatus = (bot, chat_id, job_name, build_number) => {
    jenkins.build.get(job_name, build_number, (err, data) => {
        if (err) throw err
        const build_result = data.result
        
        bot.sendMessage(chat_id, build_result)
    })
}

module.exports.jobBuild = jobBuild
module.exports.getLastBuildStatus = getLastBuildStatus