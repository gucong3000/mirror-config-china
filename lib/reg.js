'use strict';
const osArch = /64$/.test(process.env.PROCESSOR_ARCHITEW6432 || process.arch) ? 64 : 32;
const path = require('path');
const spawn = require('./spawn');
const sudo = require('./sudo');
const regExe = path.join(process.env.SystemRoot, 'system32/reg.exe');

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

async function add (key, values) {
	const oldValues = await query(key);
	const regSpawn = /^(?:HKCU|HKEY_CURRENT_USER)\W/.test(key) ? spawn : sudo.spawn;
	return Promise.all(
		Object.keys(values).map(valueName => {
			if (values[valueName] === oldValues[valueName]) {
				return;
			}
			return regSpawn(
				[
					regExe,
					'ADD',
					path.win32.normalize(key),
					'/v',
					valueName,
					'/t',
					'REG_EXPAND_SZ',
					'/d',
					values[valueName],
					'/f',
					'/reg:' + osArch
				],
				{
					stdio: 'inherit',
					echo: true
				}
			);
		})
	);
}

const reqCache = {};

async function queryAsync (key) {
	const stdout = await spawn([
		regExe,
		'QUERY',
		key,
		'/reg:' + osArch
	], {
		encoding: 'utf8'
	});
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
}

function query (key) {
	key = path.win32.normalize(key);
	if (reqCache[key]) {
		return reqCache[key];
	}
	reqCache[key] = queryAsync(key);
	return reqCache[key];
}

function regDelete (key, value) {
	return (/^(?:HKCU|HKEY_CURRENT_USER)\W/.test(key) ? spawn : sudo.spawn)(
		[
			regExe,
			'DELETE',
			path.win32.normalize(key),
			'/v',
			value,
			'/f',
			'/reg:' + osArch
		],
		{
			stdio: 'inherit',
			echo: true
		}
	);
}

module.exports = {
	add,
	query,
	delete: regDelete
};
