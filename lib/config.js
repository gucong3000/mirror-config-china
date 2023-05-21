
const reg = require('./reg');
const assert = require('assert');

let mirrors;

function getMirror () {
	mirrors = mirrors || binaryMirrorConfig();
	return mirrors;
}
async function binaryMirrorConfig () {
	const controller = new AbortController();
	const pkg = await Promise.any(
		[
			'https://npm.elemecdn.com/binary-mirror-config/package.json',
			(process.env.npm_config_registry || 'https://registry.npmmirror.com') + '/binary-mirror-config/latest',
		].map(async url => {
			const res = await fetch(
				url,
				{ signal: controller.signal },
			);
			assert.ok(res.ok);
			return res.json();
		}),
	).catch(() => require('binary-mirror-config/package.json')).catch(() => {});
	controller.abort();
	return pkg?.mirrors?.china;
}

function getBinPrefix (mirrors) {
	return mirrors && Object.keys(mirrors).map(
		pkg => mirrors[pkg],
	).map(
		pkg => pkg.remote_path && pkg.host,
	).filter(Boolean).reduce(
		(result, host) => result.length < host.length ? result : host,
	);
}

async function getConf (argv) {
	const isWin = process.platform === 'win32';
	const npmrc = {
		'registry': 'https://registry.npmmirror.com',
		'corepack-npm-registry': 'https://registry.npmmirror.com',

		'disturl': '{bin-mirrors}/node',

		/* eslint no-template-curly-in-string: "off" */
		'better-sqlite3-binary-host': '{bin-mirrors}/better-sqlite3',
		'canvas-binary-host-mirror': '{bin-mirrors}/node-canvas-prebuilt/v{version}',
		'canvas-prebuilt-binary-host-mirror': '{bin-mirrors}/node-canvas-prebuilt/v{version}',
		'chromedriver-cdnurl': '{bin-mirrors}/chromedriver',
		'couchbase-binary-host-mirror': '{bin-mirrors}/couchbase/v{version}',
		'cypress-download-path-template': '{bin-mirrors}/cypress/${version}/${platform}-${arch}/cypress.zip',
		'debug-binary-host-mirror': '{bin-mirrors}/node-inspector',
		'electron-builder-binaries-mirror': '{bin-mirrors}/electron-builder-binaries/',
		'electron-mirror': '{bin-mirrors}/electron/',
		'flow-bin-binary-host-mirror': '{bin-mirrors}/flow/v',
		'fse-binary-host-mirror': '{bin-mirrors}/fsevents',
		'fuse-bindings-binary-host-mirror': '{bin-mirrors}/fuse-bindings/v{version}',
		'git4win-mirror': '{bin-mirrors}/git-for-windows',
		'gl-binary-host-mirror': '{bin-mirrors}/gl/v{version}',
		'grpc-node-binary-host-mirror': '{bin-mirrors}',
		'hackrf-binary-host-mirror': '{bin-mirrors}/hackrf/v{version}',
		'keytar-binary-host': '{bin-mirrors}/keytar',
		'leveldown-binary-host-mirror': '{bin-mirrors}/leveldown/v{version}',
		'leveldown-hyper-binary-host-mirror': '{bin-mirrors}/leveldown-hyper/v{version}',
		'mknod-binary-host-mirror': '{bin-mirrors}/mknod/v{version}',
		'node-sqlite3-binary-host-mirror': '{bin-mirrors}',
		'node-tk5-binary-host-mirror': '{bin-mirrors}/node-tk5/v{version}',
		'nodegit-binary-host-mirror': '{bin-mirrors}/nodegit/v{version}/',
		'nwjs-urlbase': '{bin-mirrors}/nwjs/v',
		'operadriver-cdnurl': '{bin-mirrors}/operadriver',
		'phantomjs-cdnurl': '{bin-mirrors}/phantomjs',
		'playwright-download-host': '{bin-mirrors}/playwright',
		'profiler-binary-host-mirror': '{bin-mirrors}/node-inspector/',
		// https://github.com/puppeteer/puppeteer/commit/9758cae029f90908c4b5340561d9c51c26aa2f21
		'puppeteer-download-base-url': '{bin-mirrors}/chrome-for-testing',
		'python-mirror': '{bin-mirrors}/python',
		'rabin-binary-host-mirror': '{bin-mirrors}/rabin/v{version}',
		're2-download-mirror': '{bin-mirrors}/node-re2',
		'robotjs-binary-host': '{bin-mirrors}/robotjs',
		'sass-binary-site': '{bin-mirrors}/node-sass',
		'saucectl-install-binary-mirror': '{bin-mirrors}/saucectl',
		'sentrycli-cdnurl': '{bin-mirrors}/sentry-cli',
		'sharp-binary-host': '{bin-mirrors}/sharp',
		'sharp-libvips-binary-host': '{bin-mirrors}/sharp-libvips',
		'sodium-prebuilt-binary-host-mirror': '{bin-mirrors}/sodium-prebuilt/v{version}',
		'sqlite3-binary-site': '{bin-mirrors}/sqlite3',
		'swc-binary-site': '{bin-mirrors}/node-swc',
		'utf-8-validate-binary-host-mirror': '{bin-mirrors}/utf-8-validate/v{version}',
		'utp-native-binary-host-mirror': '{bin-mirrors}/utp-native/v{version}',
		'zmq-prebuilt-binary-host-mirror': '{bin-mirrors}/zmq-prebuilt/v{version}',
	};
	const mirrors = await getMirror();
	npmrc.registry = mirrors?.ENVS.COREPACK_NPM_REGISTRY || npmrc.registry;

	const env = {
		https_proxy: null,
		http_proxy: null,

		// https://github.com/nodejs/node-gyp/
		NODEJS_ORG_MIRROR: npmrc.disturl,
		IOJS_ORG_MIRROR: '{bin-mirrors}/iojs',
	};

	if (isWin) {
		// https://github.com/hakobera/nvmw/
		env.NVMW_NPM_MIRROR = '{bin-mirrors}/npm';
		env.Path = 'node_modules\\.bin;%Path%';
	} else {
		env.PATH = 'node_modules/.bin:$PATH';
		if (process.platform === 'darwin') {
			// https://brew.sh/index_zh-cn
			env.HOMEBREW_BOTTLE_DOMAIN = 'https://mirrors.tuna.tsinghua.edu.cn/homebrew/homebrew-bottles';
		}
	}

	const opts = {
		binMirrorsPrefix: getBinPrefix(mirrors) || 'https://cdn.npmmirror.com/binaries',
		npmrc: npmrc,
		env: env,
	};

	for (const key in mirrors?.ENVS) {
		const value = mirrors.ENVS[key];
		if (/^\w+:\/\//.test(value) && !/\w+_ORG_MIRROR$/i.test(key)) {
			npmrc[key.toLowerCase().replace(/^npm_config_/, '').replaceAll('_', '-')] = value.replace(opts.binMirrorsPrefix, '{bin-mirrors}');
		}
	}

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
			return;
		} else if (/^env-/i.test(key)) {
			env[key.slice(4).toUpperCase().replace(/-/g, '_')] = value;
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

	fixUrl(env);
	fixUrl(npmrc);

	[
		'NODEJS',
		'IOJS',
	].forEach(project => {
		const propName = project + '_ORG_MIRROR';
		(
			isWin
				? [
					// https://github.com/hakobera/nvmw/
					'NVMW_' + propName,
					// https://github.com/marcelklehr/nodist
					'NODIST_' + project.slice(0, 4) + '_MIRROR',
				]
				: [
					// https://github.com/creationix/nvm
					'NVM_' + propName,
					// https://github.com/tj/n
					project.slice(0, -2) + '_MIRROR',
				]
		).filter(Boolean).forEach(prefixPropName => {
			Object.defineProperty(env, prefixPropName, {
				set: (value) => {
					env[propName] = value;
				},
				get: () => env[propName],
				enumerable: true,
			});
		});
	});

	if (isWin && (!env.http_proxy || !env.https_proxy)) {
		const settings = await reg.query('HKCU/Software/Microsoft/Windows/CurrentVersion/Internet Settings');
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
	}

	if (!env.http_proxy && env.https_proxy) {
		env.http_proxy = env.https_proxy;
		// npmrc['http-proxy'] = env.https_proxy;
	}
	return opts;
}
module.exports = getConf;
