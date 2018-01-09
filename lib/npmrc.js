'use strict';
const fs = require('fs-extra');
const config = require('./config');

function setConf (argv, configFile) {
	const npmrc = config(argv);

	// 读取npmrc文件
	return fs.readFile(configFile, 'utf-8').catch(err => {
		if (err.code === 'ENOENT') {
			// 文件不存在
			return '';
		} else {
			throw err;
		}
	}).then(content => {
		// 按行遍历原有配置，改其内容
		var config = content.match(/^.*$/gm).filter(line => (
			!(/^(.+?)=/.test(line) && RegExp.$1.toLowerCase() in npmrc)
		));

		while (config.length && !config[config.length - 1]) {
			config.pop();
		}

		if (config.length) {
			config.push('');
		}

		// 将文件中没有的配置项，追加到其末尾
		Object.keys(npmrc).forEach(key => {
			if (npmrc[key]) {
				config.push(key + '=' + npmrc[key]);
			}
		});

		config.push('');

		// 将配置转换为字符串
		config = config.join('\n');

		// 如果文件内容有变化，保存结果
		if (content !== config) {
			return fs.writeFile(configFile, config);
		}
	});
}

module.exports = setConf;
