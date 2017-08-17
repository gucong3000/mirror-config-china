'use strict';
const npmrc = require('./npmrc');
const exec = require('mz/child_process').exec;

var argv;
try {
	argv = JSON.parse(process.env.npm_config_argv).original;
} catch (ex) {
	argv = process.argv;
}

// 查找npmrc文件路径
exec('npm config get globalconfig').then(result => {
	var configFile = result[0] && result[0].trim();
	if (!configFile) {
		throw result[1];
	}
	return npmrc(argv, configFile).catch(e => {
		if (e.code === 'EACCES' || /\bpermissions?\b/i.test(e.message)) {
			console.error(e.message);
			console.error('Please try running this command again as root/Administrator.');
		} else {
			console.error(e);
		}
		process.exitCode = 1;
	});
});
