'use strict';
const childProcess = require('child_process');
const fs = require('fs-extra');
const spawnAsync = require('./spawn');

const isRoot = process.getuid && !process.getuid();
const cache = {};

function outputFileSync (file, data) {
	console.log('>', 'tee', file);
	return fs.outputFile(file, data);
}

function outputFile (file, data) {
	if (isRoot) {
		return outputFileSync(file, data);
	} else {
		cache.fs[file] = data.toString();
	}
}

function spawn () {
	const args = Array.from(arguments);
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

function save (sync) {
	if (!(cache.cmd.length + Object.keys(cache.fs).length)) {
		return;
	}
	const commands = [
		'sudo',
		process.execPath,
		__filename,
		'__SUDO__',
		JSON.stringify(cache)
	];
	const options = {
		stdio: 'inherit'
	};

	clear();

	if (sync) {
		childProcess.spawnSync(commands.shift(), commands, options);
	} else {
		return spawnAsync(commands, options);
	}
}

if (process.mainModule === module && process.argv[2] === '__SUDO__') {
	const cache = JSON.parse(process.argv[3]);
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
	});
} else {
	clear();
	process.on('exit', () => save(true));
	module.exports = {
		outputFile: outputFile,
		cache: cache,
		spawn: spawn,
		clear: clear,
		save: save
	};
}
