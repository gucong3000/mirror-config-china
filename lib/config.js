import {
	baseUrl,
	npmrc as aliRc,
} from '../data/ali-bin-mirror.js';

async function getConf (argv = []) {
	const userRc = {};

	const tplValue = {
		'bin-mirror': baseUrl,
	};
	// 解析命令行参数
	argv.map(
		arg => arg.match(/^--(\w+.+?)=(.*?)$/),
	).filter(Boolean).forEach(([, key, value]) => {
		if (/\w+-prefix$/i.test(key)) {
			tplValue[key.slice(0, -7)] = value;
		} else {
			userRc[key.toLowerCase()] = value;
		}
	});

	// 用户配置与阿里配置合并
	const npmrc = {
		...aliRc,
		...userRc,
	};

	// 解析配置中的模板语法
	for (const key in npmrc) {
		if (npmrc[key]) {
			npmrc[key] = npmrc[key].replace(/{(.+?)}/g, (s, key) => tplValue[key] || s);
		}
	}

	const isWin = process.platform === 'win32';

	// 环境变量准备
	let env = isWin
		? {
			NVMW_NODEJS_ORG_MIRROR: npmrc.disturl,
			NODIST_NODE_MIRROR: npmrc.disturl,
			Path: 'node_modules\\.bin;%Path%',
		}
		: {
			NVM_NODEJS_ORG_MIRROR: npmrc.disturl,
			N_NODE_MIRROR: npmrc.disturl,
			PATH: 'node_modules/.bin:$PATH',
		};

	env = {
		NODEJS_ORG_MIRROR: npmrc.disturl,
		NODE_MIRROR: npmrc.disturl,
		...env,
	};

	return {
		env,
		npmrc,
	};
}

export {
	getConf,
};
export default getConf;
