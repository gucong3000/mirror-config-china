const config = require('../lib/config');
const { before } = require('mocha');
const { assert } = require('chai');

async function got (url, options = {}) {
	const res = await fetch(url, {
		method: 'HEAD',
		redirect: 'follow',
		...options
	});
	return res;
}

describe('mirror config 中提供的url地址的可用性', () => {
	let opts;
	before(async () => {
		opts = await config([]);
	});

	it('registry', async () => {
		assert.ok(opts.npmrc.registry, '应获取到 registry 地址');

		const pkgRes = await got(
			opts.npmrc.registry + '/gulp-preprocess/',
			{
				method: 'GET'
			}
		);
		assert.ok(pkgRes.ok);
		assert.match(pkgRes.headers.get('Content-Type'), /^application\/json\b/, 'HTTP 响应头 Content-Type 异常');
		const data = await pkgRes.json();
		assert.containsAllKeys(data, [
			'name',
			'description',
			'versions',
			'readme',
			'author',
			'license'
		]);
	});
	it('node.js 下载地址镜像', async () => {
		assert.equal(
			opts.npmrc.disturl,
			opts.env.NODEJS_ORG_MIRROR
		);
		const pkgRes = await got(
			opts.npmrc.disturl + '/v18.16.0/node-v18.16.0-x64.msi'
		);
		assert.ok(pkgRes.ok);
		assert.equal(pkgRes.headers.get('Content-Type'), 'application/octet-stream', 'HTTP 响应头 Content-Type 异常');
		assert.isAbove(+pkgRes.headers.get('Content-Length'), 0xFFFFFF, 'HTTP 响应头 Content-Length 异常');
	});

	it('python-mirror', async () => {
		const pkgRes = await got(
			opts.npmrc['python-mirror'] + '/3.11.1/python-3.11.1-amd64.exe'
		);
		console.log(pkgRes.url);
		assert.ok(pkgRes.ok);
		assert.equal(pkgRes.headers.get('Content-Type'), 'application/octet-stream', 'HTTP 响应头 Content-Type 异常');
		assert.isAbove(+pkgRes.headers.get('Content-Length'), 0xFFFFFF, 'HTTP 响应头 Content-Length 异常');
	});
});
