'use strict';
const env = require('./env');
const npm = require('./npm');

var argv;
try {
	argv = JSON.parse(process.env.npm_config_argv).original;
} catch (ex) {
	//
}

return npm(argv).then(() => env()).then(() => {
	console.log('Done. please restart your shell.');
}).catch(e => {
	if (e.code === 'EACCES' || /\bpermissions?\b/i.test(e.message)) {
		console.error(e.message);
		console.error('Please try running this command again as root/Administrator.');
	} else {
		console.error(e);
	}
	process.exitCode = 1;
});
