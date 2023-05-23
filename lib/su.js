try {
	(await import('./sudo.js')).runAs();
} catch (error) {
	console.error(error);
	if (!process.exitCode) {
		process.exitCode = Math.abs(error.errno) || 1;
	}
	if (process.platform === 'win32') {
		process.stdin.read();
	}
}
