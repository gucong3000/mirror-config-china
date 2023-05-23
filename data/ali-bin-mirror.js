import assert from 'node:assert/strict';
import npmrc from './npmrc.js';

// 从网络读取 npm 包 binary-mirror-config 的 package.json
// 为防止网络抽风，同时从两个 URL 获取，
// 一个是饿了么的 unpak 服务，
// 另一个是 npm registry ，默认从 npm 提供的环境变量读取，
// 如果用户用的是 yarn 之类，会读不到，那使用阿里镜像
async function getAliNpmMirrorCfg () {
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
	// 并发的http请求，任意一个成功后，终止其他
	controller.abort();
	// 为了防止他们未来修改相关代码，做容错处理
	return pkg?.mirrors?.china;
}

// 查找阿里镜像的最新地址，防止他们将来再换域名
// 从阿里团队开发的npm包，binary-mirror-config 的 package.json 读取镜像配置，取 url 最短的那个（最短的大概率是镜像的根目录）
function getAliNpmBinMirrorUrl (aliNpmBinMirrorCfg) {
	return aliNpmBinMirrorCfg && Object.keys(aliNpmBinMirrorCfg).map(
		pkg => aliNpmBinMirrorCfg[pkg],
	).map(
		pkg => pkg.remote_path && pkg.host,
	).filter(Boolean).reduce(
		(result, host) => result.length < host.length ? result : host,
	);
}

let baseUrl = 'https://cdn.npmmirror.com/binaries';

async function load () {
	const aliNpmBinMirrorCfg = await getAliNpmMirrorCfg();
	baseUrl = getAliNpmBinMirrorUrl(aliNpmBinMirrorCfg);
	npmrc.registry = aliNpmBinMirrorCfg?.ENVS?.COREPACK_NPM_REGISTRY || npmrc.registry;
	for (const key in aliNpmBinMirrorCfg?.ENVS) {
		const value = aliNpmBinMirrorCfg.ENVS[key];
		if (/^https?:\/\//.test(value) && !/\w+_ORG_MIRROR$/i.test(key) && !/_REGISTRY$/i.test(key)) {
			npmrc[key.toLowerCase().replace(/^npm_config_/, '').replaceAll('_', '-')] = value.replace(baseUrl, '{bin-mirror}');
		}
	}
	return npmrc;
};

await load();

export {
	baseUrl,
	npmrc,
};
export default {
	baseUrl,
	npmrc,
};
