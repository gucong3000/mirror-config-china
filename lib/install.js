'use strict';
const update = require('./update');
const path = require('path');
const os = require('os');

let argv;
try {
	argv = JSON.parse(process.env.npm_config_argv).original;
} catch (ex) {
	argv = process.argv.slice(2);
}

let configFile = process.env.npm_config_userconfig;
if (configFile) {
	configFile = path.resolve(configFile);
} else {
	configFile = path.join(os.homedir(), '.npmrc');
}

module.exports = update(argv, configFile);
