'use strict';
const path = require('path');
const reEnvKey = process.platform === 'win32'
	? /%(\w+)%/g
	: /\$(\w+)\b/g;

function getEnvValue (key, env = {}) {
	let value = process.env[key] || env[key];
	if (value) {
		value = value.replace(reEnvKey, (s, key) => getEnvValue(key, env) || s);
	}
	return value;
}

function normalize (value, env = {}) {
	return unique(value.replace(reEnvKey, (s, key) => getEnvValue(key, env) || s));
}

function unique (str) {
	return Array.from(new Set(str.split(path.delimiter))).filter(dir => dir.trim()).join(path.delimiter);
}

module.exports = {
	normalize,
	unique,
	getEnvValue,
	reEnvKey
};
