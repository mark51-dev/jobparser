const puppeter = require('puppeteer');

async function main() {
	const browser = await puppeter.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto('https://www.google.com');
}

main();
