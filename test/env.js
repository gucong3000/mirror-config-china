'use strict';
const assert = require('assert');
const path = require('path');
const os = require('os');
const util = require('util');

if (!util.promisify) {
	util.promisify = require('util.promisify');
}

const exec = util.promisify(require('child_process').execFile);
const readFile = util.promisify(require('fs').readFile);

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
						process.env[key] = value;
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
					process.env[key] = value;
				}
			);
		}, () => {});
	}));
}

const initEnv = process.platform === 'win32' ? initWinEnv : initEnvPosix;

describe('environment variables', () => {
	before(() => {
		initEnv();
	});

	it('NODEJS_ORG_MIRROR', () => {
		assert.strictEqual(process.env.NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('IOJS_ORG_MIRROR', () => {
		assert.strictEqual(process.env.IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVM_NODEJS_ORG_MIRROR', () => {
		assert.strictEqual(process.env.NVM_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('NVM_IOJS_ORG_MIRROR', () => {
		assert.strictEqual(process.env.NVM_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVMW_NODEJS_ORG_MIRROR', () => {
		assert.strictEqual(process.env.NVMW_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});
	it('NVMW_IOJS_ORG_MIRROR', () => {
		assert.strictEqual(process.env.NVMW_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVMW_NPM_MIRROR', () => {
		assert.strictEqual(process.env.NVMW_NPM_MIRROR, 'https://npm.taobao.org/mirrors/npm');
	});

	it('NODIST_NODE_MIRROR', () => {
		assert.strictEqual(process.env.NODIST_NODE_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('NODIST_IOJS_MIRROR', () => {
		assert.strictEqual(process.env.NODIST_IOJS_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});
});
