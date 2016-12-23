'use strict';
const exec = require('exec-extra');
const MIRRORS = require('./mirrors');

function confitSet(argv) {
	argv = argv || process.argv;

	var mirrors = Object.keys(MIRRORS).map(key => {
		return [key.toLowerCase(), MIRRORS[key]];
	});

	argv.forEach(function(arg) {
		if(/^--(\w+.?)=(.+?)$/.test(arg)) {
			var result = [RegExp.$1, RegExp.$2];
			mirrors.push(result);
		}
	});

	var cmds = mirrors.map(function(args) {
		return exec.npm(
			['config', '-g', 'set'].concat(args)
		);
	});

	return Promise.all(cmds);
}

module.exports = confitSet;
