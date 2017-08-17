#!/usr/bin/env node

'use strict';
const npmrc = require('./npmrc');
const path = require('path');

npmrc(process.argv, path.join(process.cwd(), '.npmrc')).catch(console.error);
