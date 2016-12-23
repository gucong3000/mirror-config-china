var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

describe('env', function() {
	console.log(process.env);

	it('electron', function() {
		assert.ok(process.env.npm_config_electron_mirror);
	});
	it('node', function() {
		assert.ok(process.env.npm_config_nodejs_org_mirror);
	});
});
