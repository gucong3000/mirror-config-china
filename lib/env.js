'use strict';
const path = require('path');
const os = require('os');
const exec = (require('util').promisify || require('util.promisify'))(require('child_process').execFile);
const fs = require('fs-extra');

function getMirrors (env, tpl) {
	return Object.keys(env).map(key => {
		process.env[key] = env[key];
		return tpl(key, env[key]);
	});
}

function envForWin (env) {
	const cmdTplSetx = (key, url) => ['SETX', key, url];
	const cmdTplReg = (key, url) => ['REG', 'ADD', 'HKCU\\Environment', '/v', key, '/d', url, '/f'];

	return exec('where', ['SETX']).then(
		() => cmdTplSetx,
		() => cmdTplReg
	).then(cmdTpl => (
		getMirrors(env, cmdTpl)
	)).then(cmds => (
		Promise.all(
			cmds.map(cmdArgs => (
				// console.log(cmdArgs[0], cmdArgs.slice(1).join(' '))
				exec(cmdArgs[0], cmdArgs.slice(1))
			))
		)
	));
}

function envInProfile (env) {
	// 环境变量信息转换为shell脚本
	let sh = getMirrors(env, (key, url) => `export ${key}=${url}`).sort();

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
