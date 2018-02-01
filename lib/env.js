'use strict';
const path = require('path');
const os = require('os');
const exec = (require('util').promisify || require('util.promisify'))(require('child_process').execFile);
const fs = require('fs-extra');

const MIRRORS = {
	iojs: [
		'IOJS_ORG_MIRROR',
		'NODIST_IOJS_MIRROR',
		'NVM_IOJS_ORG_MIRROR',
		'NVMW_IOJS_ORG_MIRROR'
	],
	node: [
		'NODEJS_ORG_MIRROR',
		'NODIST_NODE_MIRROR',
		'NVM_NODEJS_ORG_MIRROR',
		'NVMW_NODEJS_ORG_MIRROR'
	],
	npm: [
		'NVMW_NPM_MIRROR'
	]
};

function getMirrors (tmp) {
	return Array.prototype.concat.apply(
		[],
		Object.keys(MIRRORS).map(project => {
			const url = 'https://npm.taobao.org/mirrors/' + project;
			return MIRRORS[project].map(key => {
				process.env[key] = url;
				return tmp(key, url);
			});
		})
	);
}

function envForWin () {
	const cmdTmpSetx = (key, url) => ['SETX', key, url];
	const cmdTmpReg = (key, url) => ['REG', 'ADD', 'HKCU\\Environment', '/v', key, '/d', url, '/f'];

	return exec('where', ['SETX']).then(
		() => cmdTmpSetx,
		() => cmdTmpReg
	).then(getMirrors).then(cmds => Promise.all(cmds.map(cmdArgs => exec(cmdArgs[0], cmdArgs.slice(1)))));
}

function envInProfile () {
	// 环境变量信息转换为shell脚本
	let sh = getMirrors((key, url) => `export ${key}=${url}`);

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
