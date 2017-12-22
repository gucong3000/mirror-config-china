'use strict';
const npmrc = require('./npmrc');
const env = require('./env');

var argv;
try {
	argv = JSON.parse(process.env.npm_config_argv).original;
} catch (ex) {
	argv = process.argv;
}

npmrc(argv, process.env.npm_config_userconfig).catch(e => {
	if (e.code === 'EACCES' || /\bpermissions?\b/i.test(e.message)) {
		console.error(e.message);
		console.error('Please try running this command again as root/Administrator.');
	} else {
		console.error(e);
	}
	process.exitCode = 1;
});

env();
