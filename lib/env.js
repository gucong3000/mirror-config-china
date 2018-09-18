'use strict';
const fs = require('fs-extra');
const path = require('path');

const envPath = require('./envPath');
const spawn = require('./spawn');
const sudo = require('./sudo');
const reg = require('./reg');

function getMirrors (env, tpl) {
	return Object.keys(env).map(key => {
		if (env[key]) {
			process.env[key] = envPath.normalize(env[key], env);
		}

		return tpl(key, env[key]);
	}).filter(Boolean);
}

async function setx (key, value, global) {
	const regKey = (global ? 'HKLM/SYSTEM/CurrentControlSet/Control/Session Manager' : 'HKCU') + '/Environment';
	const oldEnv = await reg.query(regKey);
	if (value) {
		value = envPath.unique(value.replace(envPath.reEnvKey, (s, subKey) => (subKey === key && oldEnv[key]) || s));
		if (!global || oldEnv[key] !== value) {
			await (global ? sudo.spawn : spawn)(
				[
					path.join(process.env.SystemRoot, 'system32/setx.exe'),
					global && '/M',
					key,
					value
				].filter(Boolean),
				{
					stdio: 'inherit',
					echo: true
				}
			);
		}
	} else if (oldEnv[key]) {
		await reg.delete(regKey, key);
	}
	if (global && /^[A-Z]+(?:_[A-Z]+)+$/.test(key) && value) {
		await setx(key);
	}
}

async function envForWin (env) {
	await Promise.all(
		getMirrors(env, async (key, value) => {
			if (/^\w+_proxy$/i.test(key)) {
				await setx(key, value, false);
			} else {
				await setx(key, value, true);
			}
		})
	);

	const commandConfig = await reg.query('HKCU/Software/Microsoft/Command Processor');
	let autoRun = commandConfig.autoRun;
	if (autoRun) {
		autoRun = (autoRun.replace(/^.*?\(+\s*(.*?)\s*\)+(\s*\d*\s*>\s*nul\s*)*$/, '$1').split(/\)\s*&\s*\(/g));
	} else {
		autoRun = [];
	}

	const aliases = {
		cd: 'cd /d $*',
		ls: 'ls --show-control-chars -F --color $*',
		pwd: 'cd',
		clear: 'cls',
		unalias: 'alias /d $1',
		vi: 'vim $*'
	};

	autoRun.unshift(
		[
			path.win32.normalize('%SYSTEMROOT%/system32/setx.exe'),
			'GIT_INSTALL_ROOT /k',
			path.win32.normalize('HKLM/SOFTWARE/GitForWindows/InstallPath'),
			' || echo 0'
		].join(' '),
		`set "Path=${env.Path}"`
	);
	autoRun.push.apply(autoRun, Object.keys(aliases).map(key => `DOSKEY ${key}=${aliases[key]}`));

	// autoRun.push(
	// 	// HKEY_CLASSES_ROOT\Directory\shell\Cmder\command
	// 	'"D:\\apps\\cmder\\vendor\\clink\\clink.bat" inject --autorun'
	// );
	autoRun = Array.from(new Set(autoRun));

	await Promise.all([
		reg.add('HKCU/Software/Microsoft/Command Processor', {
			AutoRun: '((' + autoRun.join(') & (') + ')) 1>nul 2>nul'
		})
	]);
}

async function updateProfile (sh, file) {
	if (sh.length) {
		sh.unshift('# Created by mirror-config-china');
		sh.push(
			'# End of mirror-config-china',
			''
		);
	} else {
		return;
	}

	const oldContent = await fs.readFile(file, 'utf8').catch(() => '');
	const newContent = sh.join('\n');

	if (oldContent.trim() !== newContent.trim()) {
		await sudo.outputFile(file, newContent);
	}
}

async function envInProfile (env) {
	// 环境变量信息转换为shell脚本
	let shProxy = [];
	let lastProxy = {};
	let shEnv = getMirrors(env, (key, value) => {
		if (value) {
			if (/^(\w+)_proxy$/i.test(key)) {
				const type = RegExp.$1.toLowerCase();
				if (env[key] === lastProxy.server) {
					shProxy.push(`export "${key}=$${lastProxy.key}"`);
				} else {
					lastProxy.key = key;
					lastProxy.server = env[key];
					shProxy.push(`curl ${type}://t.co --max-time 10 --silent --output /dev/null --proxy ${lastProxy.server} && export "${key}=${lastProxy.server}" || export ${key}=`);
				}
			} else {
				return `export ${key}=${value}`;
			}
		}
	}).sort();
	shEnv.push('[ -s "$HOME/.nvm/nvm.sh" ] && \\. "$HOME/.nvm/nvm.sh"  # This loads nvm');
	await Promise.all([
		updateProfile(shProxy, '/etc/profile.d/proxy.sh'),
		updateProfile(shEnv, '/etc/profile.d/node.sh')
	]);
}

if (process.platform === 'win32') {
	module.exports = envForWin;
} else {
	module.exports = envInProfile;
}
