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

const months = [
	'Січня',
	'Лютого',
	'Березня',
	'Квітня',
	'Травеня',
	'Червня',
	'Липня',
	'Серпня',
	'Вересня',
	'Жовтня',
	'Листопада',
	'Грудня',
];

class DjinniParser extends AbstractParser {
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
	}
	async parse(): Promise<void> {
		await this.getLatestJobs();
	}
	private async getLatestJobs(): Promise<void> {
		const res = await request
			.get('https://djinni.co/jobs/416474-middle-senior-react-developer/')
			.then((res: any) => {
				const $ = cheerio.load(res);
				const jobDescription = $('.job-post--short-description').text().trim();
				const jobText = $(
					'.job-post--short-description + .profile-page-section'
				)
					.text()
					.trim();
				const dateVacancy = this.getTimeFromVacancy(
					$('.text-muted').text().trim()
				);
				return {
					jobDescription,
					jobText,
					dateVacancy,
				};
			})
			.catch((err: Error) => console.log('Error'));
		console.log(res);
	}

	private getTimeFromVacancy(dateText: any): number {
		const text = dateText.match(/\d+ [а-яА-Яґєіиї]+ \d+/)[0];
		const [day, month, year] = text.split(' ');

		const index = months.findIndex(
			(monthText) => monthText.toLocaleLowerCase() === month
		);

		return new Date(`${index}-${day}-${year}`).getTime();
	}

	// private parseDetails() {
	// 	const url = Urls.mainUrl + '/jobs/504582-unity-mobile-game-developer/';
	// }
}

new DjinniParser();
