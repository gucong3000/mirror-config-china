
const assert = require('assert');
const config = require('../lib/config');

describe('environment variables', () => {
	let env;
	before(async () => {
		const opts = await config([]);
		env = opts.env;
	});

	it('NODEJS_ORG_MIRROR', () => {
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
	});

	it('NODE_MIRROR', () => {
		assert.strictEqual(env.NODE_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
	});

	if (process.platform === 'win32') {
		it('NVMW_NODEJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
		});

		it('NODIST_NODE_MIRROR', () => {
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
		});
	} else {
		it('NVM_NODEJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
		});

		it('N_NODE_MIRROR', () => {
			assert.strictEqual(env.N_NODE_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
		});

		if (process.platform === 'darwin') {
			it('HOMEBREW_BOTTLE_DOMAIN', () => {
				assert.strictEqual(env.HOMEBREW_BOTTLE_DOMAIN, 'https://mirrors.aliyun.com/homebrew/homebrew-bottles');
			});
		}
	}
});
describe('config', () => {
	it('--disturl', async () => {
		const opts = await config(['--disturl=https://nodejs.mock']);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://nodejs.mock');
		assert.strictEqual(env.NODE_MIRROR, 'https://nodejs.mock');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://nodejs.mock');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.N_NODE_MIRROR, 'https://nodejs.mock');
		}
	});
	it('--bin-mirrors-prefix', async () => {
		const opts = await config(['--bin-mirrors-prefix=https://mirror.mock']);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://mirror.mock/node');
		assert.strictEqual(env.NODE_MIRROR, 'https://mirror.mock/node');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://mirror.mock/node');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://mirror.mock/node');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://mirror.mock/node');
			assert.strictEqual(env.N_NODE_MIRROR, 'https://mirror.mock/iojs');
		}
	});
	it('proxy', async () => {
		const opts = await config([
			'--https-proxy=https://proxy.https.mock',
			'--http-proxy=https://proxy.http.mock',
		]);
		const env = opts.env;
		assert.strictEqual(env.https_proxy, 'https://proxy.https.mock');
		assert.strictEqual(env.http_proxy, 'https://proxy.http.mock');
	});
	it('--env-*', async () => {
		const opts = await config([
			'--env-mock-env=test.mok',
		]);
		const env = opts.env;
		assert.strictEqual(env.MOCK_ENV, 'test.mok');
	});
	it('--*-mirror', async () => {
		const opts = await config([
			'--nodejs-org-mirror=https://nodejs.mock',
			'--npm-mirror=https://npmjs.mock',
		]);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://nodejs.mock');
		assert.strictEqual(env.NODE_MIRROR, 'https://nodejs.mock');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://nodejs.mock');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.N_NODE_MIRROR, 'https://nodejs.mock');
		}
	});
});
