'use strict';
const npmrc = {
	registry: 'https://registry.npm.taobao.org',
	disturl: 'https://npm.taobao.org/dist',
	'chromedriver-cdnurl': '{mirrors}/chromedriver',
	'couchbase-binary-host-mirror': '{mirrors}/couchbase/v{version}',
	'debug-binary-host-mirror': '{mirrors}/node-inspector',
	'electron-mirror': '{mirrors}/electron/',
	'flow-bin-binary-host-mirror': '{mirrors}/flow/v',
	'fse-binary-host-mirror': '{mirrors}/fsevents',
	'fuse-bindings-binary-host-mirror': '{mirrors}/fuse-bindings/v{version}',
	'git4win-mirror': '{mirrors}/git-for-windows',
	'gl-binary-host-mirror': '{mirrors}/gl/v{version}',
	'grpc-node-binary-host-mirror': '{mirrors}',
	'hackrf-binary-host-mirror': '{mirrors}/hackrf/v{version}',
	'leveldown-binary-host-mirror': '{mirrors}/leveldown/v{version}',
	'leveldown-hyper-binary-host-mirror': '{mirrors}/leveldown-hyper/v{version}',
	'mknod-binary-host-mirror': '{mirrors}/mknod/v{version}',
	'node-sqlite3-binary-host-mirror': '{mirrors}',
	'node-tk5-binary-host-mirror': '{mirrors}/node-tk5/v{version}',
	'nodegit-binary-host-mirror': '{mirrors}/nodegit/v{version}/',
	'operadriver-cdnurl': '{mirrors}/operadriver',
	'phantomjs-cdnurl': '{mirrors}/phantomjs',
	'profiler-binary-host-mirror': '{mirrors}/node-inspector/',
	'puppeteer-download-host': '{mirrors}',
	'python-mirror': '{mirrors}/python',
	'rabin-binary-host-mirror': '{mirrors}/rabin/v{version}',
	'sass-binary-site': '{mirrors}/node-sass',
	'sodium-prebuilt-binary-host-mirror': '{mirrors}/sodium-prebuilt/v{version}',
	'sqlite3-binary-site': '{mirrors}/sqlite3',
	'utf-8-validate-binary-host-mirror': '{mirrors}/utf-8-validate/v{version}',
	'utp-native-binary-host-mirror': '{mirrors}/utp-native/v{version}',
	'zmq-prebuilt-binary-host-mirror': '{mirrors}/zmq-prebuilt/v{version}'
};
/*
const prebuild = require('binary-mirror-config').china;
const got = require('got');
Promise.all(
	Object.keys(prebuild).map(pkgName => {
		if (pkgName === 'ENVS') {
			return;
		}
		return got('https://registry.npmjs.com/' + pkgName, {
			json: true
		}).then(
			res => res.body.versions[res.body['dist-tags'].latest]
		).then(pkg => {
			try {
				return pkg.binary.module_name;
			} catch (ex) {
				return pkgName.replace(/-/g, '_');
			}
		}).then(moduleName => {
			Object.keys(prebuild[pkgName]).forEach(key => {
				if (/[A_Z]/.test(key)) {
					return;
				}
				const value = prebuild[pkgName][key];
				if (typeof value === 'string') {
					npmrc[moduleName + '_binary_' + key + '_mirror'] = value;
				}
			});
		});
	})
).then(() => {
	console.log(npmrc);
});
*/
function getConf (argv) {
	argv.forEach(arg => {
		if (/^--(\w+.+?)=(.*?)$/.test(arg)) {
			npmrc[RegExp.$1] = RegExp.$2;
		}
	});

	Object.keys(npmrc).forEach(key => {
		if (npmrc[key]) {
			npmrc[key] = npmrc[key].replace(/\{mirrors\}/g, 'https://npm.taobao.org/mirrors');
		}
	});
	return npmrc;
}
module.exports = getConf;
