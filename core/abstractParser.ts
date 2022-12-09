import { IJobPost } from './interfaces/post.interface';

export abstract class AbstractParser {
	private jobList: IJobPost[] = [];
	constructor() {
		this.execute();
	}

	async execute() {
		await this.login();
		await this.parse();
	}
	abstract login(): Promise<void>;
	abstract parse(): Promise<void>;
}
