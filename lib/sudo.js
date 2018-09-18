'use strict';
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const spawnAsync = require('./spawn');
let isRoot = require('is-elevated')();

const cache = {};

async function outputFileSync (file, data, mtime) {
	console.log('>', 'tee', file);
	if (mtime) {
		try {
			const fd = await fs.open(file, 'r+');
			await fs.write(fd, data);
			await fs.futimes(fd, mtime, mtime);
			await fs.close(fd);
			return;
		} catch (ex) {
			//
		}
	}
	return fs.outputFile(file, data);
}

async function outputFile (file, data, mtime) {
	isRoot = await isRoot;
	if (isRoot) {
		await outputFileSync(file, data, mtime);
	} else {
		cache.fs[file] = [data.toString(), mtime];
	}
}

async function spawn () {
	const args = Array.from(arguments);
	isRoot = await isRoot;
	if (isRoot) {
		return spawnAsync.apply(this, args);
	} else {
		cache.cmd.push(args);
	}
}

function clear () {
	cache.cmd = [];
	cache.fs = {};
}

async function output () {
	const config = JSON.stringify(cache, null, '\t');
	clear();
	const sudoDir = path.join(process.env.npm_config_tmp || os.tmpdir(), 'mirror-config-china-sudo');
	await fs.emptyDir(sudoDir);
	const configFile = path.join(sudoDir, `${process.pid}.json`);
	await fs.outputFile(configFile, config);

	const commands = process.platform === 'win32'
		? [
			'powershell.exe',
			'Start-Process',
			process.execPath,
			[
				__filename,
				'__SUDO__',
				configFile
			].map(arg => `"${arg}"`).join(','),
			'-Verb',
			'RunAs'
		]
		: [
			'sudo',
			'--preserve-env',
			process.env.SUDO_USER && ('--user=' + process.env.SUDO_USER),
			process.execPath,
			__filename,
			'__SUDO__',
			configFile
		].filter(Boolean);

	const options = {
		stdio: 'inherit'
	};

	try {
		return spawnAsync(commands, options);
	} catch (error) {
		// await fs.unlink(configFile);
		error.code = 'EACCES';
		throw error;
	}
}

function save () {
	if (cache.cmd.length || Object.keys(cache.fs).length) {
		return output();
	}
}

async function sudo (configFile) {
	const cache = await fs.readJson(configFile);
	await fs.unlink(configFile);
	try {
		await Promise.all(
			Object.keys(cache.fs).map(file => (
				outputFileSync(file, cache.fs[file][0], cache.fs[file][1] && new Date(cache.fs[file][1]))
			)).concat(
				cache.cmd.map(args => spawnAsync.apply(this, args))
			)
		);
	} catch (error) {
		console.error(error);
		if (!process.exitCode) {
			process.exitCode = Math.abs(error.errno) || 1;
			process.platform === 'win32' && process.stdin.read(1);
		}
	}
}

if (process.mainModule === module && process.argv[2] === '__SUDO__') {
	sudo(process.argv[3]);
} else {
	clear();
	process.on('beforeExit', () => save());
	module.exports = {
		outputFile,
		cache,
		spawn,
		clear,
		save
	};
}
