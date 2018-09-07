'use strict';
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
	let binMirrorPrefix = 'https://npm.taobao.org/mirrors';
	const isWin = process.platform === 'win32';
	const npmrc = {
		registry: 'https://registry.npm.taobao.org',
		disturl: '{mirrors}/node',
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

	const env = {
		// https://github.com/nodejs/node-gyp/
		NODEJS_ORG_MIRROR: npmrc.disturl,
		IOJS_ORG_MIRROR: '{mirrors}/iojs'
	};

	if (isWin) {
		// https://github.com/hakobera/nvmw/
		env.NVMW_NPM_MIRROR = '{mirrors}/npm';
	}

	// ProxyServer    REG_SZ    http=192.168.16.41:1080;https=safe.com:1109
	// ProxyServer    REG_SZ    192.168.16.41:1080
	// AutoConfigURL    REG_SZ    http://192.168.16.41:1080/pac

	// REG QUERY "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings"

	argv.forEach(arg => {
		if (!/^--(\w+.+?)=(.*?)$/.test(arg)) {
			return;
		}
		let key = RegExp.$1;
		const value = RegExp.$2;
		if (/^bin-mirrors-prefix$/i.test(key)) {
			binMirrorPrefix = value;
			return;
		} else if (/^(https?)[-_]proxy$/i.test(key)) {
			key = RegExp.$1.toLowerCase();
			env[key + '_proxy'] = value;
			key = key + '-proxy';
		} else if (/^(?:\w+-)*(NODE|IO|NPM)(?:JS)?(?:-?ORG)?-MIRROR$/i.test(key)) {
			key = RegExp.$1.toUpperCase();
			env[key === 'NPM' ? 'NVMW_NPM_MIRROR' : (key + 'JS_ORG_MIRROR')] = value;
			if (key === 'NODE') {
				key = 'disturl';
			} else {
				return;
			}
		} else if (/^disturl$/i.test(key)) {
			env.NODEJS_ORG_MIRROR = value;
		}
		npmrc[key.toLowerCase()] = value;
	});

	function fixUrl (obj) {
		Object.keys(obj).forEach(key => {
			if (obj[key]) {
				obj[key] = obj[key].replace(/\{mirrors\}/g, binMirrorPrefix);
			}
		});
		return obj;
	}

	fixUrl(env);
	[
		'NODEJS',
		'IOJS'
	].forEach(project => {
		const propName = project + '_ORG_MIRROR';
		(
			isWin ? [
				// https://github.com/hakobera/nvmw/
				'NVMW_' + propName,
				// https://github.com/marcelklehr/nodist
				'NODIST_' + project.slice(0, 4) + '_MIRROR'
			] : [
				// https://github.com/creationix/nvm
				'NVM_' + propName,
				// https://github.com/tj/n
				project.slice(0, -2) + '_MIRROR'
			]
		).filter(Boolean).forEach(prefixPropName => {
			Object.defineProperty(env, prefixPropName, {
				set: (value) => {
					env[propName] = value;
				},
				get: () => env[propName],
				enumerable: true
			});
		});
	});

	return {
		npmrc: fixUrl(npmrc),
		env: env
	};
}
module.exports = getConf;
