import spawn from '../lib/spawn.js';

describe('install', () => {
	it('install script', async () => {
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
