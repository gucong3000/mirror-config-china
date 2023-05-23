import config from './lib/config.js';
const opts = await config(process.argv.slice(2));
for (const key in opts.npmrc) {
	opts.env['npm_config_' + key.replace(/-/g, '_')] = opts.npmrc[key];
}
Object.assign(process.env, opts.env, process.env);
