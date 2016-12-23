'use strict';
const path = require('path');
const exec = require('exec-extra');
const fs = require('fs-extra-async');
const MIRRORS = require('./mirrors');

function setEnv() {
	Object.assign(process.env, MIRRORS);
}

function envForWin() {
	setEnv();
	let reg = Object.keys(MIRRORS).sort().map(key => {
		return `"${ key }"="${ MIRRORS[key] }"`;
	});

	reg.unshift(
		'Windows Registry Editor Version 5.00',
		'',
		'[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment]'
	);

	reg = reg.join('\r\n');
	const regFilePath = path.join(__dirname, '../dist/env.reg');

	return fs.outputFile(regFilePath, reg).then(() => {
		return exec.sudo(
			[
				'regedit.exe',
				'//S',
				regFilePath
			]
		);
	});
}

function envInProfile() {
	setEnv();
	let sh = Object.keys(MIRRORS).sort().map(key => {
		return `export ${ key }=${ MIRRORS[key] }`;
	});
	sh.push('');
	const distPatch = path.join(__dirname, '../dist/mirrors.sh');
	const shFilePath = '/etc/profile.d/mirrors.sh';
	return fs.outputFile(distPatch, sh.join('\n')).then(() => {
		return exec.cp(
			[
				distPatch,
				shFilePath,
			], {
				stdio: 'inherit',
			}
		);
	}).then(() => {
		return exec.chmod(
			[
				'777',
				distPatch,
				shFilePath,
			], {
				stdio: 'inherit',
			}
		);
	});
}

if(process.platform === 'win32') {
	module.exports = envForWin;
} else {
	module.exports = envInProfile;
}
