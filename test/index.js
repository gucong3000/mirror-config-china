'use strict';
const assert = require('assert');
const util = require('util');
if (!util.promisify) {
	util.promisify = require('util.promisify');
}
const exec = util.promisify(require('child_process').execFile);

describe('environment variables', function() {
	before(() => {
		if (process.platform == 'win32') {
			return exec('REG', ['QUERY', 'HKCU\\Environment']).then(regs => {
				regs.stdout.replace(/^\s*(\w+)\s+REG_\w+\s*(.+)$/gm, (s, key, value) => {
					process.env[key] = value;
				});
			});
		}
	});

	it('NODEJS_ORG_MIRROR', function() {
		assert.equal(process.env.NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('NVM_NODEJS_ORG_MIRROR', function() {
		assert.equal(process.env.NVM_NODEJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/node');
	});

	it('IOJS_ORG_MIRROR', function() {
		assert.equal(process.env.IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});

	it('NVM_IOJS_ORG_MIRROR', function() {
		assert.equal(process.env.NVM_IOJS_ORG_MIRROR, 'https://npm.taobao.org/mirrors/iojs');
	});
});

describe('npm config', function() {
	it('electron', function() {
		assert.equal(process.env.npm_config_electron_mirror, 'https://npm.taobao.org/mirrors/electron/');
	});
	it('git4win_mirror', function() {
		assert.equal(process.env.npm_config_git4win_mirror, 'https://npm.taobao.org/mirrors/git-for-windows');
	});
	it('python_mirror', function() {
		assert.equal(process.env.npm_config_python_mirror, 'https://npm.taobao.org/mirrors/python');
	});
});
