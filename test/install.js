'use strict';
const spawn = require('../lib/spawn');

describe('install', () => {
	it('install script', async () => {
		await spawn([
			process.execPath,
			require.resolve('../lib/install')
		], {
			encoding: 'utf8',
			env: {
				PATH: process.env.PATH
			}
		});
	});
});
