'use strict';
const spawn = require('./spawn');
const fs = require('fs-extra');
const sudo = require('./sudo');

function getMirrors (env, tpl) {
	return Object.keys(env).map(key => {
		if (process.platform === 'win32') {
			process.env[key] = env[key].replace(/%.*%$/ig, s => process.env[s.slice(1, -1)] || s);
		} else {
			process.env[key] = env[key].replace(/\$\w+\b/g, s => process.env[s.slice(1)] || s);
		}
		return tpl(key, env[key]);
	});
}

function envForWin (env) {
	const cmdTplSetx = (key, url) => ['SETX', key, url];
	const cmdTplReg = (key, url) => ['REG', 'ADD', 'HKCU\\Environment', '/v', key, '/d', url, '/f'];

	return spawn(['where', 'SETX']).then(
		() => cmdTplSetx,
		() => cmdTplReg
	).then(cmdTpl => (
		getMirrors(env, cmdTpl)
	)).then(cmds => (
		Promise.all(
			cmds.map(cmdArgs => (
				spawn(cmdArgs, {
					echo: true
				})
			))
		)
	));
}

function envInProfile (env) {
	// 环境变量信息转换为shell脚本
	let sh = getMirrors(env, (key, url) => `export ${key}=${url}`).sort();

	sh.unshift('\n\n# Created by mirror-config-china');
	sh.push(
		'export NVM_DIR="$HOME/.nvm"',
		'[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"  # This loads nvm',
		'[ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion',
		'# End of mirror-config-china'
	);

	let shFilePath = '/etc/profile.d/node.sh';

	return fs.readFile(shFilePath, 'utf8').catch(() => '').then(content => {
		const newContent = (content
			.replace(/(?:^|\n+)# Created by mirror-config-china\n(.*?\n)*?# End of mirror-config-china(?=\n|$)/g, '')
			.trimRight() + sh.join('\n')).trim();

		if (newContent !== content.trim()) {
			sudo.outputFile(shFilePath, newContent + '\n');
		}
	});
}

if (process.platform === 'win32') {
	module.exports = envForWin;
} else {
	module.exports = envInProfile;
}
