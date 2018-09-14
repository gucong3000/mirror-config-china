'use strict';
const childProcess = require('child_process');

function stdio (stdio, options) {
	const arrStdio = [];
	if (stdio) {
		stdio.on('data', data => {
			arrStdio.push(data);
		});
	}
	return () => {
		stdio = Buffer.concat(arrStdio);
		if (options.encoding && options.encoding !== 'buffer') {
			stdio = stdio.toString(options.encoding);
		}
		return stdio;
	};
}

function spawn (commands, options = {}) {
	if (options.echo) {
		console.log('>', commands.join(' '));
	}
	const child = childProcess.spawn(commands.shift(), commands, options);
	let getStdout = stdio(child.stdout, options);
	let getStderr = stdio(child.stderr, options);
	if (child.stdin && options.input) {
		if (options.input.pipe) {
			options.input.pipe(child.stdin);
		} else {
			child.stdin.end(options.input);
		}
	}

	return new Promise((resolve, reject) => {
		child.on('error', reject);

		child.on('exit', code => {
			if (code) {
				const stderr = getStderr();
				const err = new Error('> ' + child.spawnargs.join(' ') + '\n' + (String(stderr) || `child exited with code ${code}`));
				err.stderr = stderr;
				err.stdout = getStdout();
				err.errno = code;
				reject(err);
			} else {
				resolve(getStdout());
			}
		});
	});
}

module.exports = spawn;
