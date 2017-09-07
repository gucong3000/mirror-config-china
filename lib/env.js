'use strict';
const path = require('path');
const os = require('os');
const exec = require('mz/child_process').execFile;
const fs = require('fs-extra');
const config = require('./config');


function envForWin(argv) {
	const MIRRORS = config(argv);

	// 将环境变量转化为数组
	let reg = Object.keys(MIRRORS).sort().map(key => {
		if (MIRRORS[key]) {
			return `"${ key }"="${ MIRRORS[key] }"`;
		}
	}).filter(Boolean);

	// 环境变量与预期完全一致时，什么都不做
	if (!reg.length) {
		return Promise.resolve();
	}

	// 将数组拼接为windows的reg文件格式
	reg.unshift(
		'Windows Registry Editor Version 5.00',
		'',
		'[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment]'
	);

	reg = reg.join('\r\n');
	// reg文件保存路径
	const regFilePath = path.join(__dirname, '../dist/env.reg');

	// 写入reg文件
	return fs.outputFile(regFilePath, reg).then(() => {
		var regedit = path.join(process.env.windir, 'regedit.exe');
		var args = ['//S', regFilePath];
		// 尝试直接使用windows的注册表编辑器导入reg文件
		return exec(regedit, args).catch(function() {
			// 权限不足时，尝试在命令行中调用注册表编辑器
			return exec(regedit, args, {
				shell: true
			});
		}).catch(function(err) {
			// 权限不足时抛出异常
			err.code = 'EACCES';
			throw err;
		});
	});
}

function envInProfile(argv) {
	const MIRRORS = config(argv);

	// 环境变量信息转换为shell脚本
	let sh = Object.keys(MIRRORS).sort().map(key => {
		if (MIRRORS[key]) {
			return `export ${ key.toUpperCase() }=${ MIRRORS[key] }`;
		}
	}).filter(Boolean);

	// 环境变量与预期完全一致时，什么都不做
	if (!sh.length) {
		return Promise.resolve();
	}

	sh.unshift('\n\n# Created by mirror-config-china');
	sh.push('# End of mirror-config-china\n');

	const home = os.homedir();
	let shFilePath;
	[
		'.bashrc',
		'.bash_profile',
		'.zshrc'
	].some(file => {
		file = path.join(home, file);
		if (fs.existsSync(file)) {
			shFilePath = file;
			return shFilePath;
		}
	});

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
