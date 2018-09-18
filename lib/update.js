'use strict';
const config = require('./config');
const npmrc = require('./npmrc');
const sudo = require('./sudo');
const apt = require('./apt');
const env = require('./env');

async function update (argv, configFile) {
	const opts = await config(argv);
	try {
		await Promise.all([
			configFile && npmrc(opts.npmrc, configFile),
			env(opts.env),
			apt(opts.apt)
		]);
		await sudo.save();
	} catch (error) {
		if (error.code === 'EACCES' || /\b(?:access|permissions?)\b/i.test(error.message)) {
			console.error(error.message);
			console.error('Please try running this command again as root/Administrator.');
		} else {
			console.error(error);
		}
		process.exitCode = Math.abs(error.errno) || 1;
	}
}
module.exports = update;
