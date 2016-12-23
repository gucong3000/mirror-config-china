#!/usr/bin/env node
const env = require('./lib/env');
const npm = require('./lib/npm');
function init() {
	env().then(() => {
		return npm();
	}).then(() => {
		console.log('Done. please restart your shell.');
	}).catch(e => {
		if(e.code === 'EACCES') {
			console.error('permission denied, are you root?');
		} else {
			console.error(e);
		}
	});
}

module.exports = init;

if(process.mainModule === module) {
	init();
}
