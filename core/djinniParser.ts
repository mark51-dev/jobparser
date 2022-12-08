const { AbstractParser } = require('./abstractParser');
let request = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const cookieJar = request.jar();
request = request.defaults({
	jar: cookieJar,
});

enum Urls {
	mainUrl = 'https://djinni.co',
	loginUrl = 'https://djinni.co/login?from=frontpage_main',
}

class DjinniParser extends AbstractParser {
	$: any = null;
	async login(): Promise<void> {
		await request.get(Urls.mainUrl);
		const csrf_token = cookieJar
			.getCookieString(Urls.mainUrl)
			.split(' ')[0]
			.split('=')[1]
			.replace(';', '');

		try {
			await request.post(Urls.loginUrl, {
				form: {
					email: '',
					password: '',
					csrfmiddlewaretoken: csrf_token,
				},
				headers: {
					referer: Urls.loginUrl,
				},
				options: {
					simple: true,
					followAllRedirects: false,
				},
			});
		} catch (e: any) {}
		const res = await request.get(Urls.mainUrl + '/jobs/');

		this.$ = await new Promise((resolve) => resolve(cheerio.load(res)));
	}
	async parse(): Promise<void> {
		this.$('.list-jobs__item.list__item').each((index: any, item: any) => {
			console.log(this.$(item).find('.profile span').text().trim());
			console.log(this.$(item).find('.profile').attr('href'));
		});
	}
}

new DjinniParser();
