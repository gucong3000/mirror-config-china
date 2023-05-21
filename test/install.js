
const spawn = require('../lib/spawn');

describe('install', () => {
	it('install script', async function () {
		if (process.platform === 'win32') {
			this.skip();
			return;
		}
		await spawn([
			process.execPath,
			require.resolve('../lib/install'),
		], {
			encoding: 'utf8',
			env: {
				PATH: process.env.PATH,
			},
		});
	});
});
