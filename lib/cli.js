#!/usr/bin/env node
'use strict';
const npmrc = require('./npmrc');
const env = require('./env');
const path = require('path');

npmrc(process.argv, path.join(process.cwd(), '.npmrc')).catch(console.error);
env(process.argv).catch(console.error);
