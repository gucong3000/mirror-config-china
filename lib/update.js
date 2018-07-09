'use strict';
const config = require('./config');
const npmrc = require('./npmrc');
const env = require('./env');

function update (argv, configFile) {
	const opts = config(argv);
	return Promise.all([
		configFile && npmrc(opts.npmrc, configFile),
		env(opts.env)
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
module.exports = update;
