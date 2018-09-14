'use strict';
const reg = require('./reg');
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
	const isWin = process.platform === 'win32';
	const npmrc = {
		registry: 'https://registry.npm.taobao.org',
		disturl: '{bin-mirrors}/node',
		'chromedriver-cdnurl': '{bin-mirrors}/chromedriver',
		'couchbase-binary-host-mirror': '{bin-mirrors}/couchbase/v{version}',
		'debug-binary-host-mirror': '{bin-mirrors}/node-inspector',
		'electron-mirror': '{bin-mirrors}/electron/',
		'flow-bin-binary-host-mirror': '{bin-mirrors}/flow/v',
		'fse-binary-host-mirror': '{bin-mirrors}/fsevents',
		'fuse-bindings-binary-host-mirror': '{bin-mirrors}/fuse-bindings/v{version}',
		'git4win-mirror': '{bin-mirrors}/git-for-windows',
		'gl-binary-host-mirror': '{bin-mirrors}/gl/v{version}',
		'grpc-node-binary-host-mirror': '{bin-mirrors}',
		'hackrf-binary-host-mirror': '{bin-mirrors}/hackrf/v{version}',
		'leveldown-binary-host-mirror': '{bin-mirrors}/leveldown/v{version}',
		'leveldown-hyper-binary-host-mirror': '{bin-mirrors}/leveldown-hyper/v{version}',
		'mknod-binary-host-mirror': '{bin-mirrors}/mknod/v{version}',
		'node-sqlite3-binary-host-mirror': '{bin-mirrors}',
		'node-tk5-binary-host-mirror': '{bin-mirrors}/node-tk5/v{version}',
		'nodegit-binary-host-mirror': '{bin-mirrors}/nodegit/v{version}/',
		'operadriver-cdnurl': '{bin-mirrors}/operadriver',
		'phantomjs-cdnurl': '{bin-mirrors}/phantomjs',
		'profiler-binary-host-mirror': '{bin-mirrors}/node-inspector/',
		'puppeteer-download-host': '{bin-mirrors}',
		'python-mirror': '{bin-mirrors}/python',
		'rabin-binary-host-mirror': '{bin-mirrors}/rabin/v{version}',
		'sass-binary-site': '{bin-mirrors}/node-sass',
		'sodium-prebuilt-binary-host-mirror': '{bin-mirrors}/sodium-prebuilt/v{version}',
		'sqlite3-binary-site': '{bin-mirrors}/sqlite3',
		'utf-8-validate-binary-host-mirror': '{bin-mirrors}/utf-8-validate/v{version}',
		'utp-native-binary-host-mirror': '{bin-mirrors}/utp-native/v{version}',
		'zmq-prebuilt-binary-host-mirror': '{bin-mirrors}/zmq-prebuilt/v{version}'
	};

	const env = {
		https_proxy: null,
		http_proxy: null,

		// https://github.com/nodejs/node-gyp/
		NODEJS_ORG_MIRROR: npmrc.disturl,
		IOJS_ORG_MIRROR: '{bin-mirrors}/iojs'
	};

	if (isWin) {
		// https://github.com/hakobera/nvmw/
		env.NVMW_NPM_MIRROR = '{bin-mirrors}/npm';
		env.Path = 'node_modules\\.bin;%Path%';
	} else {
		env.PATH = 'node_modules/.bin:$PATH';
		if (process.platform === 'darwin') {
			// https://brew.sh/index_zh-cn
			env.HOMEBREW_BOTTLE_DOMAIN = '{ali-mirrors}/homebrew/homebrew-bottles';
		}
	}

	const apt = {
		'gitlab-runner': '{apt-mirrors}/gitlab-runner/{release-id}',
		'docker-ce': '{ali-mirrors}/docker-ce/linux/{release-id}',
		'gitlab-ce': '{apt-mirrors}/gitlab-ce/{release-id}',
		'virtualbox': '{apt-mirrors}/virtualbox/apt',
		// mongodb: '{ali-mirrors}/mongodb/apt/{release-id}',
		nodesource: '{apt-mirrors}/nodesource/deb',
		// grafana: '{apt-mirrors}/grafana/apt',
		main: '{ali-mirrors}'
	};

	const opts = {
		aptMirrorsPrefix: 'https://mirrors.tuna.tsinghua.edu.cn',
		binMirrorsPrefix: 'https://npm.taobao.org/mirrors',
		aliMirrorsPrefix: 'https://mirrors.aliyun.com',
		npmrc: npmrc,
		apt: apt,
		env: env
	};

	argv.forEach(arg => {
		if (!/^--(\w+.+?)=(.*?)$/.test(arg)) {
			return;
		}
		let key = RegExp.$1;
		const value = RegExp.$2;
		if (/^(\w+)-mirrors-prefix$/i.test(key)) {
			opts[RegExp.$1.toLowerCase() + 'MirrorsPrefix'] = value;
			return;
		} else if (/^(https?)[-_]proxy$/i.test(key)) {
			key = RegExp.$1.toLowerCase();
			env[key + '_proxy'] = value;
			key = key + '-proxy';
		} else if (/^env-/i.test(key)) {
			env[key.slice(4).toUpperCase().replace(/-/g, '_')] = value;
			return;
		} else if (/^apt-mirror$/i.test(key)) {
			apt.main = value;
			return;
		} else if (/^apt-([\w-]+)-mirror$/i.test(key)) {
			apt[RegExp.$1.toLowerCase()] = value;
			return;
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
				obj[key] = obj[key].replace(/\{(\w+)-mirrors\}/g, (s, prefix) => opts[prefix + 'MirrorsPrefix'] || s);
			}
		});
		return obj;
	}

	fixUrl(apt);
	fixUrl(env);
	fixUrl(npmrc);

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

	return (
		isWin && (!env.http_proxy || !env.https_proxy)
			? reg.query('HKCU/Software/Microsoft/Windows/CurrentVersion/Internet Settings').then(settings => {
				if (settings.autoConfigURL) {
					env.https_proxy = settings.autoConfigURL.replace(/^(\w+:\/\/[^/]+).*/, '$1');
				} else if (settings.proxyEnable && settings.proxyServer) {
					settings.ProxyServer.split(';').forEach(server => {
						server = server.match(/^(?:(\w+)=)?(.*)/);
						if (server[1] && !/^https?$/.test(server[1])) {
							return;
						}
						const key = (server[1] || 'https') + '_proxy';
						if (!env[key]) {
							env[key] = 'http://' + server[2];
						}
					});
				}
			})
			: Promise.resolve()
	).then(() => {
		if (!env.http_proxy && env.https_proxy) {
			env.http_proxy = env.https_proxy;
			npmrc['http-proxy'] = env.https_proxy;
		}
		return opts;
	});
}
module.exports = getConf;
