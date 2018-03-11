require('dotenv').config()

const Nightmare = require('nightmare')
const nightmare = Nightmare({
    show: false,
    pollInterval: 1000,
    waitTimeout: 3000,
    typeInterval: 25
})

const selector = {
    input_va: '#inputMerchantId',
    button_submit_pmt: 'body > div.container > form > div:nth-child(2) > div > button',
    button_submit_bca: '#wrap > div.container > form > div:nth-child(2) > div > button',
    input_total_transaksi_pmt: 'body > div.container > form > div:nth-child(2) > div > input[type="text"]',
    input_total_transaksi_bca: '#wrap > div.container > form > div:nth-child(5) > div > input[type="text"]',
    button_pay_pmt: 'body > div.container > form > div:nth-child(4) > div > button',
    button_pay_bca: '#wrap > div.container > form > div:nth-child(8) > div > button'
}

const midtrans = (bot, chat_id, bank, va_number) => {
    let response_message = ''
    let uri = ''
    let inquire = ''
    let total = ''
    let pay = ''
    let invoice_total = 0

    if (bank == 'pmt') {
        uri = process.env.VA_PERMATA
        inquire = selector.button_submit_pmt
        total = selector.input_total_transaksi_pmt
        pay = selector.button_pay_pmt
    } else if (bank == 'bca') {
        uri = process.env.VA_BCA
        inquire = selector.button_submit_bca
        total = selector.input_total_transaksi_bca
        pay = selector.button_pay_bca
    }

    nightmare.goto(uri)
        .type(selector.input_va, va_number)
        .click(inquire)
        .wait(1500)
        .exists(pay)
        .then((result) => {
            if (result) {
                invoice_total = parseFloat(document.querySelector(total))
                response_message = `Done, mark as paid sebesar ${invoice_total}`
                bot.sendMessage(chat_id, response_message)

                return nightmare.click(pay).end()
            } else {
                response_message = `VA ga ada, mungkin udah bayar..`
                bot.sendMessage(chat_id, response_message)

                return nightmare.end()
            }
        })
        .catch((e) => {
            console.log(e)
        })
}

module.exports.midtrans = midtrans