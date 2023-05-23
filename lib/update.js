import config from './config.js';
import npmrc from './npmrc.js';
import sudo from './sudo.js';
import env from './env.js';

async function update (argv = [], configFile) {
	try {
		const opts = await config(argv);
		await Promise.all([
			configFile && npmrc(opts.npmrc, configFile),
			env(opts.env),
		]);
		await sudo.save();
		return opts;
	} catch (error) {
		if (error.code === 'EACCES' || /\b(?:access|permissions?)\b/i.test(error.message)) {
			console.error(error.message);
			console.error('Please try running this command again as root/administrator.');
		} else {
			console.error(error);
		}
		process.exitCode = Math.abs(error.errno) || 1;
	}
}

export {
	update,
};
export default update;
