'use strict';
module.exports = require('./lib/config')(process.argv.slice(2)).then(config => {
	Object.keys(config.npmrc).forEach(key => {
		config.env['npm_config_' + key.replace(/-/g, '_')] = config.npmrc[key];
	});

	Object.assign(process.env, config.env, process.env);

	if (process.mainModule === module) {
		console.log(process.env);
	}
});
