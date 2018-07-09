'use strict';
const path = require('path');
const os = require('os');
const exec = (require('util').promisify || require('util.promisify'))(require('child_process').execFile);
const fs = require('fs-extra');
const taobao = 'https://npm.taobao.org/mirrors/';

function getMirrors (argv, tpl) {
	const env = {
		NODEJS_ORG_MIRROR: taobao + 'node',
		NPMJS_ORG_MIRROR: taobao + 'npm',
		IOJS_ORG_MIRROR: taobao + 'iojs'
	};

	argv.forEach(arg => {
		if (/^--(?:\w+-)?(NODE|IO|NPM)(?:JS)?(?:-ORG)?-MIRROR=(.*?)$/i.test(arg)) {
			env[RegExp.$1.toUpperCase() + 'JS_ORG_MIRROR'] = RegExp.$2;
		} else if (/^--disturl=(.*?)$/i.test(arg)) {
			env.NODEJS_ORG_MIRROR = RegExp.$1;
		}
	});

	for (const key in env) {
		env['NVM_' + key] = env[key];
	}

	// https:// github.com/hakobera/nvmw/
	env.NVMW_NODEJS_ORG_MIRROR = env.NODEJS_ORG_MIRROR;
	env.NVMW_IOJS_ORG_MIRROR = env.IOJS_ORG_MIRROR;
	env.NVMW_NPM_MIRROR = env.NPMJS_ORG_MIRROR;

	// https://github.com/marcelklehr/nodist
	env.NODIST_NODE_MIRROR = env.NODEJS_ORG_MIRROR;
	env.NODIST_IOJS_MIRROR = env.IOJS_ORG_MIRROR;

	return Object.keys(env).map(key => {
		process.env[key] = env[key];
		return tpl(key, env[key]);
	});
}

function envForWin (argv) {
	const cmdTmpSetx = (key, url) => ['SETX', key, url];
	const cmdTmpReg = (key, url) => ['REG', 'ADD', 'HKCU\\Environment', '/v', key, '/d', url, '/f'];

	return exec('where', ['SETX']).then(
		() => cmdTmpSetx,
		() => cmdTmpReg
	).then(cmdTpl => (
		getMirrors(argv, cmdTpl)
	)).then(cmds => (
		Promise.all(
			cmds.map(cmdArgs => (
				// console.log(cmdArgs[0], cmdArgs.slice(1).join(' '))
				exec(cmdArgs[0], cmdArgs.slice(1))
			))
		)
	));
}

function envInProfile (argv) {
	// 环境变量信息转换为shell脚本
	let sh = getMirrors(argv, (key, url) => `export ${key}=${url}`);

	sh.unshift('\n\n# Created by mirror-config-china');
	sh.push('# End of mirror-config-china\n');

	const home = os.homedir();
	let shFilePath = [
		'.bash_profile',
		'.bashrc',
		'.zshrc'
	].map(
		file => path.join(home, file)
	);
	shFilePath = shFilePath.find(
		file => fs.existsSync(file)
	) || shFilePath[0];

	return fs.readFile(shFilePath, 'utf8').then(content => {
		const newContent = content
			.replace(/\n+# Created by mirror-config-china\n(export\s+.*?\n)*# End of mirror-config-china\n+/, '\n')
			.trimRight() + sh.join('\n');

		if (newContent !== content) {
			fs.writeFile(shFilePath, newContent);
		}
	});
}

if (process.platform === 'win32') {
	module.exports = envForWin;
} else {
	module.exports = envInProfile;
}
