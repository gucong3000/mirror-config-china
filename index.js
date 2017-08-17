'use strict';
const config = require('./lib/config')(process.argv);
Object.keys(config).forEach(key => {
	process.env['npm_config_' + key] = config[key];
});
console.log(process.env);
