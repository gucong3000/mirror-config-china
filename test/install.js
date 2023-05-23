import spawn from '../lib/spawn.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

describe('install', () => {
	it('install script', async () => {
		const filename = fileURLToPath(
			import.meta.url,
		);
		await spawn([
			process.execPath,
			path.resolve(
				path.dirname(filename),
				'../lib/install',
			),
		], {
			encoding: 'utf8',
			env: {
				PATH: process.env.PATH,
			},
		});
	});
});
