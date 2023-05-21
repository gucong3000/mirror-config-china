
const fs = require('fs/promises');
const path = require('path');
const spawnAsync = require('./spawn');
const cache = {};

async function isRoot () {
	const isElevated = await import('is-elevated');
	return isElevated.default();
}

function writeFileSync (file, data) {
	console.log('>', 'tee', file);
	return fs.writeFile(file, data);
}

async function writeFile (file, data) {
	if (await isRoot()) {
		return writeFileSync(file, data);
	} else {
		cache.fs[file] = data.toString();
	}
}

async function spawn (...args) {
	if (await isRoot()) {
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
	const cacheDir = path.join(__dirname, '../sudo');
	const configFile = path.join(cacheDir, `${process.pid}.json`);
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
		stdio: 'inherit',
		echo: true
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
	try {
		const cache = JSON.parse(
			await fs.readFile(process.argv[3])
		);
		await fs.rm(process.argv[3], { force: true });
		await Promise.all(
			Object.keys(cache.fs).map(file => (
				writeFileSync(file, cache.fs[file])
			)).concat(
				cache.cmd.map(args => spawnAsync.apply(this, args))
			)
		);
	} catch (error) {
		console.error(error);
		if (!process.exitCode) {
			process.exitCode = Math.abs(error.errno) || 1;
		}
		process.stdin.read();
	}
}

if (require.main === module && process.argv[2] === '__SUDO__') {
	runAs();
} else {
	clear();
	process.on('beforeExit', () => save());
	module.exports = {
		writeFile: writeFile,
		cache: cache,
		spawn: spawn,
		clear: clear,
		save: save
	};
}
