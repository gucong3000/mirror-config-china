'use strict';
const fs = require('fs-extra');
const sudo = require('./sudo');
const reg = require('./reg');

function envNormalizeWin (value, env) {
	env = env || process.env;
	return value.replace(/%.*%$/ig, s => {
		const key = s.slice(1, -1);
		if (env[key]) {
			s = env[key];
			if (/^Path$/i.test(key)) {
				s = s.split(/\s*;+\s*/).filter(path => (
					path && !/^(?:\.\\)?node_modules\\.bin$/.test(path)
				)).join(';');
			}
		}
		return s;
	});
}

function getMirrors (env, tpl) {
	return Object.keys(env).map(key => {
		if (env[key]) {
			if (process.platform === 'win32') {
				process.env[key] = envNormalizeWin(env[key]);
			} else {
				process.env[key] = env[key].replace(/\$\w+\b/g, s => process.env[s.slice(1)] || s);
			}
		}
		return tpl(key, env[key]);
	}).filter(Boolean);
}

function envForWin (env) {
	const globalEnvironmentKey = 'HKLM/SYSTEM/CurrentControlSet/Control/Session Manager/Environment';
	return reg.query(globalEnvironmentKey).then(globalEnvironment => (
		Promise.all(
			getMirrors(env, (key, value) => {
				if (value) {
					value = envNormalizeWin(value, globalEnvironment);
					return value !== globalEnvironment[key] && sudo.spawn(
						[
							'setx.exe',
							'/M',
							key,
							value
						],
						{
							stdio: 'inherit',
							echo: true
						}
					);
				} else {
					return globalEnvironmentKey[key] && reg.delete(globalEnvironmentKey, key);
				}
			})

		)
	));
}

function envInProfile (env) {
	// 环境变量信息转换为shell脚本
	let sh = getMirrors(env, (key, value) => value && `export ${key}=${value}`).sort();

	sh.unshift('\n\n# Created by mirror-config-china');
	sh.push(
		// 'export NVM_DIR="$HOME/.nvm"',
		// '[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"  # This loads nvm',
		// '[ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion',
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
