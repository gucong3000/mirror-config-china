#!/usr/bin/env node

import update from './update.js';
import { resolve } from 'node:path';

await update(process.argv.slice(2), resolve('.npmrc'));
