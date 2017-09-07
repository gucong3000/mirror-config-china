'use strict';
var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

describe.skip('environment variables', function() {
	it('electron', function() {
		assert.ok(process.env.ELECTRON_MIRROR);
	});
	it('node', function() {
		assert.ok(process.env.NODEJS_ORG_MIRROR);
	});
});

describe('npm config', function() {
	it('electron', function() {
		assert.ok(process.env.npm_config_electron_mirror);
	});
	it('node', function() {
		assert.ok(process.env.npm_config_nodejs_org_mirror);
	});
});
