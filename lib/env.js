'use strict';
const path = require('path');
const exec = require('mz/child_process').execFile;
const fs = require('fs-promise');
const MIRRORS = require('./mirrors');

function setEnv() {
	Object.keys(MIRRORS).sort().map(key => {
		// 过滤掉环境变量中已有的项目
		if (MIRRORS[key] === process.env[key]) {
			MIRRORS[key] = null;
		} else if (MIRRORS[key]) {
			process.env[key] = MIRRORS[key];
		}
	});
}

function envForWin() {
	setEnv();

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

function envInProfile() {
	setEnv();

	// 环境变量信息转换为shell脚本
	let sh = Object.keys(MIRRORS).sort().map(key => {
		if (MIRRORS[key]) {
			return `export ${ key }=${ MIRRORS[key] }`;
		}
	}).filter(Boolean);

	// 环境变量与预期完全一致时，什么都不做
	if (!sh.length) {
		return Promise.resolve();
	}

	sh.push('');

	// shell脚本保存路径
	const shFilePath = '/etc/profile.d/mirrors.sh';

	// 写入shell脚本
	return fs.outputFile(shFilePath, sh.join('\n')).then(function() {
		return fs.chmod(shFilePath, 777);
	});
}

if (process.platform === 'win32') {
	module.exports = envForWin;
} else {
	module.exports = envInProfile;
}
