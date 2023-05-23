
import update from './update.js';
import path from 'node:path';
import { homedir } from 'node:os';

let argv;
try {
	argv = JSON.parse(process.env.npm_config_argv).original;
} catch (ex) {
	argv = process.argv.slice(2);
}
function getNpmUserCfg () {
	let configFile = process.env.npm_config_userconfig;
	if (configFile) {
		configFile = path.resolve(configFile);
	} else {
		configFile = path.join(homedir(), '.npmrc');
	}
	return configFile;
}

function install (configFile = getNpmUserCfg()) {
	return update(argv, configFile);
}

await install();

export { install };
export default install;
