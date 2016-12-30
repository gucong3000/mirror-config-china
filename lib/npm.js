'use strict';
const fs = require('fs-promise');
const exec = require('mz/child_process').exec;
const MIRRORS = require('./mirrors');

function setConf(argv) {
	if(!Array.isArray(argv)) {
		argv = process.argv;
	}

	const npmrc = {
		registry: 'http://registry.npm.taobao.org',
		disturl: 'http://npm.taobao.org/dist'
	};

	Object.keys(MIRRORS).map(key => {
		return npmrc[key.toLowerCase()] = MIRRORS[key];
	});

	argv.forEach(arg => {
		if(/^--(\w+.+?)=(.+?)$/.test(arg)) {
			npmrc[RegExp.$1] = RegExp.$2;
		}
	});

	// 查找npmrc文件路径
	return exec('npm config get globalconfig').then(result => {
		var configFile = result[0] && result[0].trim();
		if(!configFile) {
			throw result[1];
		}

		// 读取npmrc文件
		return fs.readFile(configFile, 'utf-8').then(content => {
			// 按行遍历原有配置，改其内容
			var config = content.trim().split(/\s*\r?\n\s*/g).map(cfg => {
				if(/^(.+?)=/.test(cfg)) {
					var key = RegExp.$1.toLowerCase();
					if(npmrc[key]) {
						cfg = key + '=' + npmrc[key];
						npmrc[key] = null;
					}
				}
				return cfg;
			});

			// 将文件中没有的配置项，追加到其末尾
			Object.keys(npmrc).forEach(key => {
				if(npmrc[key]) {
					config.push( key + '=' + npmrc[key]);
				}
			});

			// 将配置转换为字符串
			config.push('');
			config = config.join('\n');

			// 如果文件内容有变化，保存结果
			if(content !== config) {
				return fs.writeFile(configFile, config);
			}
		});
	});
}

module.exports = setConf;
