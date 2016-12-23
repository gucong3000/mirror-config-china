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
		console.error(e);
		if(e.code === 'EACCES' || /\bpermissions?\b/i.test(e.message)) {
			console.error('Please try running this command again as root/Administrator.');
		}
	});
}

module.exports = init;

if(process.mainModule === module) {
	init();
}
