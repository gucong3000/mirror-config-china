#!/usr/bin/env node
'use strict';
const update = require('./update');
const path = require('path');

module.exports = update(process.argv.slice(2), path.resolve('.npmrc'));
