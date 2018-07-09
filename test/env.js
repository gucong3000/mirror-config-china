'use strict';
const assert = require('assert');
const path = require('path');
const util = require('util');
const os = require('os');
const config = require('../lib/config');

if (!util.promisify) {
	util.promisify = require('util.promisify');
}

const exec = util.promisify(require('child_process').execFile);
const readFile = util.promisify(require('fs').readFile);
const env = {};

function initWinEnv () {
	function getRegEnv (platform) {
		const args = [
			'QUERY',
			'HKCU\\Environment'
		];

		if (platform) {
			args.push('/reg:' + platform);
		}
		return exec('REG', args).then(
			regQuery => regQuery.stdout,
			() => {}
		);
	}
	return Promise.all([
		getRegEnv(64),
		getRegEnv(32),
		getRegEnv()
	]).then(
		regs => regs.filter(
			Boolean
		).forEach(
			regs => regs.replace(
				/^\s*(\w+)\s+REG(?:_[A-Z]+)+\s*(https?:\/\/.+?)$/gm,
				(s, key, value) => {
					if (!/^Path$/i.test(key)) {
						env[key] = value;
					}
				}
			)
		)
	);
}

function initEnvPosix () {
	const home = os.homedir();
	const files = [
		'.bash_profile',
		'.bashrc',
		'.zshrc'
	].map(
		file => path.join(home, file)
	);
	return Promise.all(files.map(file => {
		return readFile(file, 'utf8').then(sh => {
			sh.replace(
				/^export\s+(.+?)=("|')?(https?:\/\/.+?)\2\s*$/igm,
				(s, key, quote, value) => {
					env[key] = value;
				}
			);
		}, () => {});
	}));
}

const initEnv = process.platform === 'win32' ? initWinEnv : initEnvPosix;

describe('environment variables', () => {
	before(() => {
		return exec(process.execPath, [
			require.resolve('../lib/install')
		], {
			env: {
				PATH: process.env.PATH
			}
		}).then(() => (
			initEnv()
		));
	});

	it('NODEJS_ORG_MIRROR', () => {
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('IOJS_ORG_MIRROR', () => {
		assert.strictEqual(env.IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	if (process.platform === 'win32') {
		it('NVMW_NODEJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
		});
		it('NVMW_IOJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVMW_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
		});

		it('NVMW_NPM_MIRROR', () => {
			assert.strictEqual(env.NVMW_NPM_MIRROR, 'https://npm.taobao.org/mirrors/npm');
		});

		it('NODIST_NODE_MIRROR', () => {
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://npm.taobao.org/mirrors/node');
		});

		it('NODIST_IOJS_MIRROR', () => {
			assert.strictEqual(env.NODIST_IOJS_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
		});
	} else {
		it('NVM_NODEJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
		});

		it('NVM_IOJS_ORG_MIRROR', () => {
			assert.strictEqual(env.NVM_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
		});

		it('NODE_MIRROR', () => {
			assert.strictEqual(env.NODE_MIRROR, 'https://npm.taobao.org/mirrors/node');
		});

		it('IO_MIRROR', () => {
			assert.strictEqual(env.IO_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
		});
	}
});
describe('config', () => {
	it('--disturl', async () => {
		const opts = await config(['--disturl=https://nodejs.mock']);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://nodejs.mock');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://nodejs.mock');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NODE_MIRROR, 'https://nodejs.mock');
		}
	});
	it('--bin-mirrors-prefix', async () => {
		const opts = await config(['--bin-mirrors-prefix=https://mirror.mock']);
		const env = opts.env;
		assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://mirror.mock/node');
		assert.strictEqual(env.IOJS_ORG_MIRROR, 'https://mirror.mock/iojs');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://mirror.mock/node');
			assert.strictEqual(env.NVMW_IOJS_ORG_MIRROR, 'https://mirror.mock/iojs');
			assert.strictEqual(env.NVMW_NPM_MIRROR, 'https://mirror.mock/npm');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://mirror.mock/node');
			assert.strictEqual(env.NODIST_IOJS_MIRROR, 'https://mirror.mock/iojs');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://mirror.mock/node');
			assert.strictEqual(env.NVM_IOJS_ORG_MIRROR, 'https://mirror.mock/iojs');
			assert.strictEqual(env.NODE_MIRROR, 'https://mirror.mock/node');
			assert.strictEqual(env.IO_MIRROR, 'https://mirror.mock/iojs');
		}
	});
	it('proxy', async () => {
		const opts = await config([
			'--https-proxy=https://proxy.https.mock',
			'--http-proxy=https://proxy.http.mock'
		]);
		const env = opts.env;
		assert.strictEqual(env.https_proxy, 'https://proxy.https.mock');
		assert.strictEqual(env.http_proxy, 'https://proxy.http.mock');
	});
	it('--*-mirror', async () => {
		const opts = await config([
			'--nodejs-org-mirror=https://nodejs.mock',
			'--nvm-iojs-mirror=https://iojs.mock',
			'--npm-mirror=https://npmjs.mock'
		]);
		const env = opts.env;
		assert.strictEqual(env.IOJS_ORG_MIRROR, 'https://iojs.mock');
		if (process.platform === 'win32') {
			assert.strictEqual(env.NVMW_IOJS_ORG_MIRROR, 'https://iojs.mock');
			assert.strictEqual(env.NVMW_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NVMW_NPM_MIRROR, 'https://npmjs.mock');
			assert.strictEqual(env.NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NODIST_IOJS_MIRROR, 'https://iojs.mock');
			assert.strictEqual(env.NODIST_NODE_MIRROR, 'https://nodejs.mock');
		} else {
			assert.strictEqual(env.NVM_NODEJS_ORG_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.NVM_IOJS_ORG_MIRROR, 'https://iojs.mock');
			assert.strictEqual(env.NODE_MIRROR, 'https://nodejs.mock');
			assert.strictEqual(env.IO_MIRROR, 'https://iojs.mock');
		}
	});
});
