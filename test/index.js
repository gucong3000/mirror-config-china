'use strict';
const assert = require('assert');
const path = require('path');
const os = require('os');
const util = require('util');
const config = require('../lib/config.js');

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
				/^\s*(\w+)\s+REG_\w+\s*(.+)$/gm,
				(s, key, value) => {
					process.env[key] = value;
				}
			)
		)
	);
}

function initEnv () {
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
				/^export\s+(.+?)=("|')?(.+?)\2\s*$/igm,
				(s, key, quote, value) => {
					process.env[key] = value;
				}
			);
		}, () => {});
	}));
}

describe('environment variables', () => {
	before(() => {
		if (process.platform === 'win32') {
			return initWinEnv();
		} else {
			return initEnv();
		}
	});

	it('NODEJS_ORG_MIRROR', () => {
		assert.equal(process.env.NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('NVM_NODEJS_ORG_MIRROR', () => {
		assert.equal(process.env.NVM_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('IOJS_ORG_MIRROR', () => {
		assert.equal(process.env.IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVM_IOJS_ORG_MIRROR', () => {
		assert.equal(process.env.NVM_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVMW_NODEJS_ORG_MIRROR', () => {
		assert.equal(process.env.NVMW_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});
	it('NVMW_IOJS_ORG_MIRROR', () => {
		assert.equal(process.env.NVMW_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVMW_NPM_MIRROR', () => {
		assert.equal(process.env.NVMW_NPM_MIRROR, 'https://npm.taobao.org/mirrors/npm');
	});
});

describe('npm config', () => {
	it('chromedriver', () => {
		assert.equal(process.env.npm_config_chromedriver_cdnurl, 'https://npm.taobao.org/mirrors/chromedriver');
	});

	it('electron', () => {
		assert.equal(process.env.npm_config_electron_mirror, 'https://npm.taobao.org/mirrors/electron/');
	});

	it('git4win', () => {
		assert.equal(process.env.npm_config_git4win_mirror, 'https://npm.taobao.org/mirrors/git-for-windows');
	});

	it('python', () => {
		assert.equal(process.env.npm_config_python_mirror, 'https://npm.taobao.org/mirrors/python');
	});

	it('puppeteer', () => {
		assert.equal(process.env.npm_config_puppeteer_download_host, 'https://npm.taobao.org/mirrors');
	});
});

describe('get config', () => {
	it('--registry', () => {
		assert.equal(config(['--registry=https://r.cnpmjs.org']).registry, 'https://r.cnpmjs.org');
	});
	it('--disturl', () => {
		assert.equal(config(['--disturl=https://cnpmjs.org/dist']).disturl, 'https://cnpmjs.org/dist');
	});
});
