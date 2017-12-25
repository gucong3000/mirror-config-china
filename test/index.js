
const assert = require('assert');
const util = require('util');
if (!util.promisify) {
	util.promisify = require('util.promisify');
}
const exec = util.promisify(require('child_process').execFile);

describe('environment variables', () => {
	before(() => {
		if (process.platform === 'win32') {
			return exec('REG', ['QUERY', 'HKCU\\Environment']).then(regs => {
				regs.stdout.replace(/^\s*(\w+)\s+REG_\w+\s*(.+)$/gm, (s, key, value) => {
					process.env[key] = value;
				});
			});
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

	it('git4win_mirror', () => {
		assert.equal(process.env.npm_config_git4win_mirror, 'https://npm.taobao.org/mirrors/git-for-windows');
	});

	it('python_mirror', () => {
		assert.equal(process.env.npm_config_python_mirror, 'https://npm.taobao.org/mirrors/python');
	});
});
