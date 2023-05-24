
import update from './update.js';
import path from 'node:path';
import { homedir } from 'node:os';

function getArgv (env) {
	let argv;
	try {
		argv = JSON.parse(env.npm_config_argv).original;
	} catch (ex) {
		argv = process.argv.slice(2);
	}
	return argv;
}

function getNpmUserCfg (env) {
	let configFile = env.npm_config_userconfig;
	if (configFile) {
		configFile = path.resolve(configFile);
	} else {
		configFile = path.join(homedir(), '.npmrc');
	}
	return configFile;
}

function install (env = process.env) {
	return update(
		getArgv(env),
		getNpmUserCfg(env),
	);
}

export {
	getArgv,
	install,
	getNpmUserCfg,
};

export default await install();
