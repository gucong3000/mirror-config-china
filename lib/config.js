'use strict';
function getConf(argv) {
	const npmrc = {
		registry: 'http://registry.npm.taobao.org',
		disturl: 'http://npm.taobao.org/dist',
		chromedriver_cdnurl: '{mirrors}chromedriver',
		electron_mirror: '{mirrors}electron/',
		git4win_mirror: '{mirrors}git-for-windows',
		nodegit_binary_host_mirror: '{mirrors}nodegit/v{version}/',
		operadriver_cdnurl: '{mirrors}operadriver',
		phantomjs_cdnurl: '{mirrors}phantomjs',
		profiler_binary_host_mirror: '{mirrors}node-inspector/',
		python_mirror: '{mirrors}python',
		sass_binary_site: '{mirrors}node-sass',
		sqlite3_binary_site: '{mirrors}sqlite3',
	};

	argv.forEach(arg => {
		if (/^--(\w+.+?)=(.*?)$/.test(arg)) {
			npmrc[RegExp.$1] = RegExp.$2;
		}
	});

	Object.keys(npmrc).forEach(key => {
		if (npmrc[key]) {
			npmrc[key] = npmrc[key].replace(/\{mirrors\}\/?/g, 'https://npm.taobao.org/mirrors/');
		}
	});
	return npmrc;
}
module.exports = getConf;
