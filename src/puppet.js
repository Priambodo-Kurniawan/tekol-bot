const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();

    await page.goto('https://example.com');
    let title = await page.title();

    console.log(title);
  
    await browser.close();
})();