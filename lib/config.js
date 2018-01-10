'use strict';
const npmrc = {
	registry: 'https://registry.npm.taobao.org',
	disturl: 'https://npm.taobao.org/dist',
	chromedriver_cdnurl: '{mirrors}/chromedriver',
	couchbase_binary_host_mirror: '{mirrors}/couchbase/v{version}',
	debug_binary_host_mirror: '{mirrors}/node-inspector',
	electron_mirror: '{mirrors}/electron/',
	flow_bin_binary_host_mirror: '{mirrors}/flow/v',
	fse_binary_host_mirror: '{mirrors}/fsevents',
	fuse_bindings_binary_host_mirror: '{mirrors}/fuse-bindings/v{version}',
	git4win_mirror: '{mirrors}/git-for-windows',
	gl_binary_host_mirror: '{mirrors}/gl/v{version}',
	grpc_node_binary_host_mirror: '{mirrors}',
	hackrf_binary_host_mirror: '{mirrors}/hackrf/v{version}',
	leveldown_binary_host_mirror: '{mirrors}/leveldown/v{version}',
	leveldown_hyper_binary_host_mirror: '{mirrors}/leveldown-hyper/v{version}',
	mknod_binary_host_mirror: '{mirrors}/mknod/v{version}',
	node_sqlite3_binary_host_mirror: '{mirrors}',
	node_tk5_binary_host_mirror: '{mirrors}/node-tk5/v{version}',
	nodegit_binary_host_mirror: '{mirrors}/nodegit/v{version}',
	operadriver_cdnurl: '{mirrors}/operadriver',
	phantomjs_cdnurl: '{mirrors}/phantomjs',
	profiler_binary_host_mirror: '{mirrors}/node-inspector',
	puppeteer_download_host: '{mirrors}',
	python_mirror: '{mirrors}/python',
	rabin_binary_host_mirror: '{mirrors}/rabin/v{version}',
	sass_binary_site: '{mirrors}/node-sass',
	sodium_prebuilt_binary_host_mirror: '{mirrors}/sodium-prebuilt/v{version}',
	sqlite3_binary_site: '{mirrors}/sqlite3',
	utf_8_validate_binary_host_mirror: '{mirrors}/utf-8-validate/v{version}',
	utp_native_binary_host_mirror: '{mirrors}/utp-native/v{version}',
	zmq_prebuilt_binary_host_mirror: '{mirrors}/zmq-prebuilt/v{version}'
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
