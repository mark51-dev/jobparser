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
		const jobUrl: any = await this.getFirstJobUrl();
		await this.getJobInfoByUrl(jobUrl);
	}
	private async getJobInfoByUrl(JobUrl: string): Promise<void> {
		return request
			.get(`https://djinni.co${JobUrl}`)
			.then((res: any) => {
				const $ = cheerio.load(res);
				const jobTitle = $('.detail--title-wrapper h1').text().trim();
				const jobDescription = $('.job-post--short-description').text().trim();
				const companyName = $('.job-details--title').text().trim();
				const jobText = $(
					'.job-post--short-description + .profile-page-section'
				)
					.text()
					.trim();
				const dateVacancy = this.getTimeFromVacancy(
					$('.text-muted').text().trim()
				);
				console.log({
					jobTitle,
					jobDescription,
					jobText,
					dateVacancy,
					companyName,
				});

				return {
					jobTitle,
					jobDescription,
					jobText,
					dateVacancy,
					companyName,
				};
			})
			.catch((err: Error) => console.log('Error'));
	}

	private getTimeFromVacancy(dateText: any): number {
		const text = dateText.match(/\d+ [а-яА-Яґєіиї]+ \d+/)[0];
		const [day, month, year] = text.split(' ');

		const index = months.findIndex(
			(monthText) => monthText.toLowerCase() === month
		);

		return new Date(`${index}-${day}-${year}`).getTime();
	}

	private async getFirstJobUrl(): Promise<string> {
		return request
			.get(Urls.mainUrl + '/jobs/')
			.then((res: any) => {
				const $ = cheerio.load(res);
				const jobUrl = $('.profile').first().attr('href').trim();
				console.log(jobUrl);
				return jobUrl;
			})
			.catch(() => console.log('Cant get latest job'));
	}
}

new DjinniParser();
