'use strict';
const osArch = /64$/.test(process.env.PROCESSOR_ARCHITEW6432 || process.arch) ? 64 : 32;
const spawn = require('./spawn');
const sudo = require('./sudo');
// const fs = require('fs-extra');
// const path = require('path');

function parseValue (type, value) {
	switch (type) {
		case 'REG_DWORD': {
			return parseInt(value);
		}
		// case 'REG_QWORD': {
		// 	value = hexToUint8Array(value);
		// 	break;
		// }
	}
	return value;
}

// function hexToUint8Array (hex) {
// 	const prefix = hex.slice(0, 2);
// 	hex = hex.slice(2);
// 	if ((hex.length % 2) !== 0) {
// 		hex = '0' + hex;
// 	}
// 	var view = new Uint8Array(hex.length / 2);
// 	for (var i = 0; i < hex.length; i += 2) {
// 		view[i / 2] = parseInt(prefix + hex.slice(i, i + 2));
// 	}
// 	return view;
// }

// function strToHex (value) {
// 	if (!value) {
// 		return '-';
// 	}
// 	if (value.includes(';')) {
// 		return 'hex(2):' + Array.from(value).map(char => (
// 			Number(char.charCodeAt(0)).toString(16)
// 		)).join(',');
// 	} else {
// 		return JSON.stringify(value);
// 	}
// }

// function add (key, values) {
// 	reqCache[key] = values;
// 	const regFile = path.join(__dirname, '../environment.reg');
// 	const regContents = [
// 		'REGEDIT4',
// 		'',
// 		`[${key.replace(/\//g, '\\')}]`
// 	].concat(
// 		Object.keys(values).sort().map((key) => (
// 			`${JSON.stringify(key)}=${strToHex(values[key])}`
// 		))
// 	);

// 	return fs.outputFile(regFile, regContents.join('\r\n')).then(() => {
// 		return spawn([
// 			'regedit.exe',
// 			'/s',
// 			regFile
// 		], {
// 			// windowsHide: true,
// 			stdio: 'ignore',
// 			shell: true,
// 			echo: true
// 		});
// 	}).then(() => fs.remove(regFile));
// }

const reqCache = {};

function query (key) {
	if (reqCache[key]) {
		return reqCache[key];
	}
	reqCache[key] = spawn([
		'reg.exe',
		'QUERY',
		key.replace(/\//g, '\\'),
		'/reg:' + osArch
	], {
		encoding: 'utf8'
	}).then(stdout => {
		return new Proxy({}, {
			get: (target, name) => {
				if (typeof name === 'string' && !target[name]) {
					const key = stdout.match(new RegExp(`^\\s*${name}\\s+(REG(?:_[A-Z]+)+)\\s+(.+)`, 'im'));
					if (key) {
						target[name] = key[2];
						return parseValue(key[1], key[2]);
					}
				}
				return target[name];
			}
		});
	});
	return reqCache[key];
}

function regDelete (key, value) {
	return sudo.spawn(
		[
			'reg.exe',
			'DELETE',
			key.replace(/\//g, '\\'),
			'/v',
			value,
			'/f'
		],
		{
			stdio: 'inherit',
			echo: true
		}
	);
}

module.exports = {
	// add: add,
	query: query,
	delete: regDelete
};
