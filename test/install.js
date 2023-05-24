
describe('install', () => {
	it('install script', async () => {
		(await import('../lib/install.js')).install();
	});

	it('install without npm', async () => {
		(await import('../lib/install.js')).install({});
	});
});
