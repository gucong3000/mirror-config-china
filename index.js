'use strict';
const envPath = require('./lib/envPath');
module.exports = require('./lib/config')(process.argv.slice(2)).then(config => {
	Object.keys(config.npmrc).forEach(key => {
		process.env['npm_config_' + key.replace(/-/g, '_')] = config.npmrc[key];
	});
	Object.keys(config.env).forEach(key => {
		process.env[key] = envPath.normalize(config.env[key], config.env);
	});

	if (process.mainModule === module) {
		console.log(process.env);
	}
});
