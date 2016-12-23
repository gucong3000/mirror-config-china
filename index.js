#!/usr/bin/env node
'use strict';
const env = require('./lib/env');
const npm = require('./lib/npm');
function init() {
	env().then(() => {
		return npm();
	}).then(() => {
		console.log('Done. please restart your shell.');
	}).catch(e => {
		if(e.code === 'EACCES' || /\bpermissions?\b/.test(e.message)) {
			var message = 'permission denied, are you ';
			if(process.platform !== 'win32') {
				message += 'root? try:\n\tsudo mirror-config-china';
			} else {
				message += 'administrator?';
			}
			console.error(message);
		} else {
			console.error(e);
		}
	});
}

module.exports = init;

if(process.mainModule === module) {
	init();
}
