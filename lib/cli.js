#!/usr/bin/env node

import update from './update.js';
import install from './install.js';
import { resolve } from 'node:path';

await install;
await update(process.argv.slice(2), resolve('.npmrc'));
