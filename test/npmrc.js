'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const config = require('../lib/config');
const npmrc = require('../lib/npmrc');

describe('npm config', () => {
	before(() => require('../'));

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
	it('--registry', async () => {
		const opts = await config(['--registry=https://r.cnpmjs.org']);
		assert.strictEqual(opts.npmrc.registry, 'https://r.cnpmjs.org');
	});
	it('--disturl', async () => {
		const opts = await config(['--disturl=https://cnpmjs.org/dist']);
		assert.strictEqual(opts.npmrc.disturl, 'https://cnpmjs.org/dist');
	});
	it('--sqlite3-binary-site', async () => {
		const opts = await config(['--sqlite3-binary-site=https://mock.npmjs.org/sqlite3']);
		assert.strictEqual(opts.npmrc['sqlite3-binary-site'], 'https://mock.npmjs.org/sqlite3');
	});
	it('--nvm-nodejs-org-mirror', async () => {
		const opts = await config([['--nvm-nodejs-org-mirror=https://mock.npmjs.org/dist']]);
		const npmrc = opts.npmrc;
		assert.strictEqual(npmrc.disturl, 'https://mock.npmjs.org/dist');
		assert.ifError(npmrc['nvm-nodejs-org-mirror']);
	});
	it('--nodejs-org-mirror', async () => {
		const opts = await config(['--nodejs-org-mirror=https://mock.npmjs.org/dist']);
		const npmrc = opts.npmrc;
		assert.strictEqual(npmrc.disturl, 'https://mock.npmjs.org/dist');
		assert.ifError(npmrc['nodejs-org-mirror']);
	});
	it('--nvm-iojs-org-mirror', async () => {
		const opts = await config(['--nvm-iojs-org-mirror=https://mock.npmjs.org/dist']);
		const npmrc = opts.npmrc;
		assert.strictEqual(npmrc.disturl, 'https://npm.taobao.org/mirrors/node');
		assert.ifError(npmrc['nvm-iojs-org-mirror']);
	});
	it('--bin-mirrors-prefix', async () => {
		const opts = await config(['--bin-mirrors-prefix=https://mirror.mock']);
		const npmrc = opts.npmrc;
		assert.strictEqual(npmrc.disturl, 'https://mirror.mock/node');
		assert.strictEqual(npmrc['chromedriver-cdnurl'], 'https://mirror.mock/chromedriver');
		assert.ifError(npmrc['bin-mirrors-prefix']);
	});
	it('--http-proxy', async () => {
		const opts = await config([
			'--https-proxy=https://proxy.https.mock',
			'--http-proxy=https://proxy.http.mock'
		]);
		const npmrc = opts.npmrc;
		assert.strictEqual(npmrc['https-proxy'], 'https://proxy.https.mock');
		assert.strictEqual(npmrc['http-proxy'], 'https://proxy.http.mock');
	});
});

describe('config file', () => {
	const mockFile = path.join(__dirname, '.npmrc');
	afterEach(() => fs.unlink(mockFile));

	it('creat a config file', async () => {
		await npmrc({
			mock: 'test'
		}, mockFile);
		const content = await fs.readFile(mockFile, 'utf8');
		assert.strictEqual(content, 'mock=test\n');
	});
	it('update a config file', async () => {
		await fs.outputFile(
			mockFile,
			[
				'mock1=old',
				'mock2=old'
			].join('\n')
		);
		await npmrc({
			mock2: 'test2',
			mock3: 'test3'
		}, mockFile);
		const content = await fs.readFile(mockFile, 'utf8');
		assert.strictEqual(
			content,
			[
				'mock1=old',
				'',
				'mock2=test2',
				'mock3=test3',
				''
			].join('\n')
		);
	});
	it('delete from config file', async () => {
		await fs.outputFile(
			mockFile,
			[
				'mock4=old',
				'mock5=old'
			].join('\n')
		);
		await npmrc({
			mock4: false
		}, mockFile);
		const content = await fs.readFile(mockFile, 'utf8');
		assert.strictEqual(content, 'mock5=old\n');
	});
	it('no change', async () => {
		const oldContent = 			[
			'mock6=old',
			'mock7=old',
			'mock8=old',
			''
		].join('\n');

		await fs.outputFile(mockFile, oldContent);
		await npmrc({}, mockFile);
		const content = await fs.readFile(mockFile, 'utf8');
		assert.strictEqual(content, oldContent);
	});
});
