#!/usr/bin/env node

const update = require('./update');
const path = require('path');

update(process.argv.slice(2), path.resolve('.npmrc'));
