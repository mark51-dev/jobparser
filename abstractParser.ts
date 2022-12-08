export abstract class AbstractParser {
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
