const { AbstractParser } = require('./abstractParser');
let request = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const cookieJar = request.jar();
request = request.defaults({
	jar: cookieJar,
});

class DjinniParser extends AbstractParser {
	$: any = null;
	async login(): Promise<void> {
		const result = await request.get('https://djinni.co');
		const csrf_token = cookieJar
			.getCookieString('https://djinni.co')
			.split(' ')[0]
			.split('=')[1]
			.replace(';', '');

		try {
			await request.post('https://djinni.co/login?from=frontpage_main', {
				form: {
					email: '',
					password: '',
					csrfmiddlewaretoken: csrf_token,
				},
				headers: {
					referer: 'https://djinni.co/login?from=frontpage_main',
				},
				options: {
					simple: true,
					followAllRedirects: false,
				},
			});
		} catch (e: any) {}
		const res = await request.get('https://djinni.co/jobs/');

		this.$ = await new Promise((resolve) => {
			return resolve(cheerio.load(res));
		});
	}
	async parse(): Promise<void> {
		console.log('Djinni start');

		console.log('---------------');
		this.$('.list-jobs__item.list__item').each((index: any, item: any) => {
			console.log(this.$(item).find('.profile span').text().trim());
			console.log(this.$(item).find('.profile').attr('href'));
		});

		console.log('Djinni end');
	}
}

new DjinniParser();
