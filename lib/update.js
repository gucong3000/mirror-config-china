'use strict';
const config = require('./config');
const npmrc = require('./npmrc');
const sudo = require('./sudo');
const apt = require('./apt');
const env = require('./env');

function update (argv, configFile) {
	const opts = config(argv);
	return Promise.all([
		configFile && npmrc(opts.npmrc, configFile),
		env(opts.env),
		apt(opts.apt)
	]).then(
		() => sudo.save(),
		(error) => {
			if (error.code === 'EACCES' || /\bpermissions?\b/i.test(error.message)) {
				console.error(error.message);
				console.error('Please try running this command again as root/Administrator.');
			} else {
				console.error(error);
			}
			process.exitCode = Math.abs(error.errno) || 1;
			return sudo.save();
		}
	);
}
module.exports = update;
