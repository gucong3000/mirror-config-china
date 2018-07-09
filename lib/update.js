'use strict';
const npmrc = require('./npmrc');
const env = require('./env');

function cli (argv, configFile) {
	return Promise.all([
		npmrc(argv, configFile),
		env(argv)
	]).catch(e => {
		if (e.code === 'EACCES' || /\bpermissions?\b/i.test(e.message)) {
			console.error(e.message);
			console.error('Please try running this command again as root/Administrator.');
		} else {
			console.error(e);
		}
		process.exitCode = 1;
	});
}
module.exports = cli;
