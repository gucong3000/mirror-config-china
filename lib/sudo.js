import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import isElevated from 'is-elevated';
import spawnAsync from './spawn.js';
const cache = {};

function writeFileSync (file, data) {
	console.log('>', 'tee', file);
	return fs.writeFile(file, data);
}

async function writeFile (file, data) {
	if (isElevated()) {
		return writeFileSync(file, data);
	} else {
		cache.fs[file] = data.toString();
	}
}

async function spawn (...args) {
	if (isElevated()) {
		return spawnAsync(...args);
	} else {
		cache.cmd.push(args);
	}
}

function clear () {
	cache.cmd = [];
	cache.fs = {};
}

async function save () {
	if (!(cache.cmd.length + Object.keys(cache.fs).length)) {
		return;
	}
	const filename = fileURLToPath(
		import.meta.url,
	);
	const dirName = path.dirname(filename);
	const cacheDir = path.resolve(dirName, '../sudo');
	const configFile = path.join(cacheDir, `${process.pid}.json`);
	const su = path.join(dirName, 'su.js');
	const commands = process.platform === 'win32'
		? [
			'powershell.exe',
			'Start-Process',
			process.execPath,
			[
				su,
				'__SUDO__',
				configFile,
			].map(arg => `"${arg}"`).join(','),
			'-Verb',
			'RunAs',
		]
		: [
			'sudo',
			'--preserve-env',
			process.execPath,
			su,
			'__SUDO__',
			configFile,
		];

	const options = {
		stdio: 'inherit',
		echo: true,
	};
	await fs.mkdir(cacheDir, { recursive: true });
	await fs.writeFile(configFile, JSON.stringify(cache));
	clear();
	try {
		await spawnAsync(commands, options);
	} catch (error) {
		await fs.rm(configFile, { force: true });
		error.code = 'EACCES';
		throw error;
	}
}

async function runAs () {
	if (process.argv[2] !== '__SUDO__') {
		return;
	}
	const cache = JSON.parse(
		await fs.readFile(process.argv[3]),
	);
	await fs.rm(process.argv[3], { force: true });
	await Promise.all(
		cache.cmd.map(args => spawnAsync(...args)),
	);
	await Promise.all(
		Object.keys(cache.fs).map(file => (
			writeFileSync(file, cache.fs[file])
		)),
	);
}

clear();
process.on('beforeExit', () => save());

export {
	writeFile,
	cache,
	spawn,
	clear,
	save,
	runAs,
};
export default {
	writeFile,
	cache,
	spawn,
	clear,
	save,
	runAs,
};
