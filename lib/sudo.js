'use strict';
const fs = require('fs-extra');
const path = require('path');
const spawnAsync = require('./spawn');
const isRoot = require('is-elevated')();
const cache = {};

function outputFileSync (file, data) {
	console.log('>', 'tee', file);
	return fs.outputFile(file, data);
}

function outputFile (file, data) {
	return isRoot.then(isRoot => {
		if (isRoot) {
			return outputFileSync(file, data);
		} else {
			cache.fs[file] = data.toString();
		}
	});
}

function spawn () {
	const args = Array.from(arguments);
	return isRoot.then(isRoot => {
		if (isRoot) {
			return spawnAsync.apply(this, args);
		} else {
			cache.cmd.push(args);
		}
	});
}

function clear () {
	cache.cmd = [];
	cache.fs = {};
}

function save () {
	if (!(cache.cmd.length + Object.keys(cache.fs).length)) {
		return;
	}

	return fs.emptyDir(path.join(__dirname, '../sudo')).then(() => {
		const configFile = path.join(__dirname, `../sudo/${process.pid}.json`);

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
				process.execPath,
				__filename,
				'__SUDO__',
				configFile
			];

		const options = {
			stdio: 'inherit'
		};
		return fs.outputJson(configFile, cache).then(() => {
			clear();
			return spawnAsync(commands, options).catch(error => {
				// return fs.unlink(configFile).catch(() => {}).then(() => {
				error.code = 'EACCES';
				throw error;
				// })
			});
		});
	});
}

if (process.mainModule === module && process.argv[2] === '__SUDO__') {
	fs.readJson(process.argv[3]).then((cache) => (
		fs.unlink(process.argv[3]).then(() => (
			Promise.all(
				Object.keys(cache.fs).map(file => (
					outputFileSync(file, cache.fs[file])
				)).concat(
					cache.cmd.map(args => spawnAsync.apply(this, args))
				)
			).catch(error => {
				console.error(error);
				if (!process.exitCode) {
					process.exitCode = Math.abs(error.errno) || 1;
				}
			})
		))
	));
} else {
	clear();
	process.on('beforeExit', () => save());
	module.exports = {
		outputFile: outputFile,
		cache: cache,
		spawn: spawn,
		clear: clear,
		save: save
	};
}
