import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';
export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd'
	});
	mocha.options.color = true;

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise(async (c, e) => {
		try {
			let files = await glob('**/*.test.js', { cwd: testsRoot })
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				e(err);
			}
		} catch {
			(err) => {
				return e(err);
			};
		}

	});
}
