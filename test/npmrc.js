'use strict';
const assert = require('assert');
const config = require('../lib/config.js');

describe('npm config', () => {
	// if (!process.env.npm_lifecycle_script) {
	// 	return;
	// }
	it('chromedriver', () => {
		assert.strictEqual(process.env.npm_config_chromedriver_cdnurl, 'https://npm.taobao.org/mirrors/chromedriver');
	});

	it('electron', () => {
		assert.strictEqual(process.env.npm_config_electron_mirror, 'https://npm.taobao.org/mirrors/electron/');
	});

	it('git4win', () => {
		assert.strictEqual(process.env.npm_config_git4win_mirror, 'https://npm.taobao.org/mirrors/git-for-windows');
	});

	it('node-inspector', () => {
		assert.strictEqual(process.env.npm_config_profiler_binary_host_mirror, 'https://npm.taobao.org/mirrors/node-inspector/');
	});

	it('node-sass', () => {
		assert.strictEqual(process.env.npm_config_sass_binary_site, 'https://npm.taobao.org/mirrors/node-sass');
	});

	it('nodegit', () => {
		assert.strictEqual(process.env.npm_config_nodegit_binary_host_mirror, 'https://npm.taobao.org/mirrors/nodegit/v{version}/');
	});

	it('operadriver', () => {
		assert.strictEqual(process.env.npm_config_operadriver_cdnurl, 'https://npm.taobao.org/mirrors/operadriver');
	});

	it('phantomjs', () => {
		assert.strictEqual(process.env.npm_config_phantomjs_cdnurl, 'https://npm.taobao.org/mirrors/phantomjs');
	});

	it('puppeteer', () => {
		assert.strictEqual(process.env.npm_config_puppeteer_download_host, 'https://npm.taobao.org/mirrors');
	});

	it('python', () => {
		assert.strictEqual(process.env.npm_config_python_mirror, 'https://npm.taobao.org/mirrors/python');
	});

	it('sqlite3', () => {
		assert.strictEqual(process.env.npm_config_sqlite3_binary_site, 'https://npm.taobao.org/mirrors/sqlite3');
	});
});

describe('get config', () => {
	it('--registry', () => {
		assert.strictEqual(config(['--registry=https://r.cnpmjs.org']).registry, 'https://r.cnpmjs.org');
	});
	it('--disturl', () => {
		assert.strictEqual(config(['--disturl=https://cnpmjs.org/dist']).disturl, 'https://cnpmjs.org/dist');
	});
	it('--sqlite3-binary-site', () => {
		const npmrc = config(['--sqlite3-binary-site=https://mock.npmjs.org/sqlite3']);
		assert.strictEqual(npmrc['sqlite3-binary-site'], 'https://mock.npmjs.org/sqlite3');
	});
	it('--nvm-nodejs-org-mirror', () => {
		const npmrc = config(['--nvm-nodejs-org-mirror=https://mock.npmjs.org/dist']);
		assert.strictEqual(npmrc.disturl, 'https://mock.npmjs.org/dist');
		assert.ifError(npmrc['nvm-nodejs-org-mirror']);
	});
	it('--nodejs-org-mirror', () => {
		const npmrc = config(['--nodejs-org-mirror=https://mock.npmjs.org/dist']);
		assert.strictEqual(npmrc.disturl, 'https://mock.npmjs.org/dist');
		assert.ifError(npmrc['nodejs-org-mirror']);
	});
	it('--nvm-iojs-org-mirror', () => {
		const npmrc = config(['--nvm-iojs-org-mirror=https://mock.npmjs.org/dist']);
		assert.strictEqual(npmrc.disturl, 'https://npm.taobao.org/mirrors/node');
		assert.ifError(npmrc['nvm-iojs-org-mirror']);
	});
});
