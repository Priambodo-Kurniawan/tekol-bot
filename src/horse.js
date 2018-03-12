var Horseman = require('node-horseman');
var horseman = new Horseman();

horseman
    .viewport(800, 600)
    .open('https://api.sandbox.veritrans.co.id:7676/permata/va/index')
    .title()
    .type('#inputMerchantId', '123456789')
    .log()
    // .screenshot('./ss/01.png')
    .click('button[type="submit"]')
    .wait(1000)
    // .log()
    // .screenshot('./ss/02.png')
    .close();