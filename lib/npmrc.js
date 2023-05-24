import fs from 'node:fs/promises';

async function setConf (npmrc, configFile) {
	// 读取npmrc文件
	let content;
	try {
		content = await fs.readFile(configFile, 'utf-8');
	} catch (err) {
		if (err.code === 'ENOENT') {
			// 文件不存在
			content = '';
		} else {
			throw err;
		}
	}

	const oldRc = {
	};

	// 按行遍历原有配置，改其内容
	let config = content.split(/\r\n|\r|\n/g).filter(line => {
		line = /^(.+?)\s*=\s*(.*?)\s*$/.exec(line.toLowerCase());
		if (line) {
			const [, key, value] = line;
			oldRc[key] = value;
			// 删除原配置中，与新配置相同的项目
			return !(key in npmrc);
		}
		return true;
	});

	// 删除文件结尾的空行
	while (config.length && !config[config.length - 1]) {
		config.pop();
	}

	// 如果原文件内容非空，添一行空行以示分割
	if (config.length) {
		config.push('');
	}

	// 将新的配置项，追加到其末尾
	for (const key in npmrc) {
		if (npmrc[key]) {
			const value = npmrc[key].toLowerCase();
			if (oldRc[key] !== value) {
				console.log('> npm config set', key, value);
			}
			config.push(key + '=' + value);
		} else if (oldRc[key]) {
			console.log('> npm config delete', key);
		}
	}

	if (config[config.length - 1]) {
		config.push('');
	}

	// 将配置转换为字符串
	config = config.join('\n');

	// 如果文件内容有变化，保存结果
	if (content !== config) {
		await fs.writeFile(configFile, config);
	}
}

export {
	setConf,
};
export default setConf;
