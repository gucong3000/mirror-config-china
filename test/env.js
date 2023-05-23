
import { assert } from 'chai';
import config from '../lib/config.js';

describe('默认环境变量', () => {
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
		it('NVM_NODEJS_ORG_MIRROR', () => {
			assert.notOk(env.NVM_NODEJS_ORG_MIRROR);
		});
		it('N_NODE_MIRROR', () => {
			assert.notOk(env.N_NODE_MIRROR);
		});
	} else {
		it('NVM_NODEJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
		});
		it('N_NODE_MIRROR', () => {
			assert.strictEqual(env.N_NODE_MIRROR, 'https://cdn.npmmirror.com/binaries/node');
		});

		it('NVMW_NODEJS_ORG_MIRROR', () => {
			assert.notOk(env.NVMW_NODEJS_ORG_MIRROR);
		});
		it('NODIST_NODE_MIRROR', () => {
			assert.notOk(env.NODIST_NODE_MIRROR);
		});
	}
});
describe('根据命令行参数改变环境变量', () => {
	it('--bin-mirror-prefix=https://my.mirror.mock --disturl={my-mirror}/path/to/nodejs/', async () => {
		const opts = await config([
			'--my-mirror-prefix=https://my.mirror.mock',
			'--disturl={my-mirror}/path/to/nodejs/',
		]);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://my.mirror.mock/path/to/nodejs/');
		assert.strictEqual(env.NODE_MIRROR, 'https://my.mirror.mock/path/to/nodejs/');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://my.mirror.mock/path/to/nodejs/');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://my.mirror.mock/path/to/nodejs/');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://my.mirror.mock/path/to/nodejs/');
			assert.strictEqual(env.N_NODE_MIRROR, 'https://my.mirror.mock/path/to/nodejs/');
		}
	});
	it('--bin-mirror-prefix=https://my.mock', async () => {
		const opts = await config(['--bin-mirror-prefix=https://my.mock']);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://my.mock/node');
		assert.strictEqual(env.NODE_MIRROR, 'https://my.mock/node');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://my.mock/node');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://my.mock/node');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://my.mock/node');
			assert.strictEqual(env.N_NODE_MIRROR, 'https://my.mock/node');
		}
	});
	it('--disturl=https://nodejs.mock', async () => {
		const opts = await config([
			'--disturl=https://nodejs.mock',
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
