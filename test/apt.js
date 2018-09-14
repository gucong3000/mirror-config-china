'use strict';
const assert = require('assert');
const mock = require('mock-fs');
const fs = require('fs-extra');
const config = require('../lib/config');
const proxyquire = require('proxyquire');

describe('apt-config', () => {
	it('default config', async () => {
		const opts = await config([]);
		const apt = opts.apt;
		assert.strictEqual(apt['gitlab-runner'], 'https://mirrors.tuna.tsinghua.edu.cn/gitlab-runner/{release-id}');
		assert.strictEqual(apt['docker-ce'], 'https://mirrors.aliyun.com/docker-ce/linux/{release-id}');
		assert.strictEqual(apt['gitlab-ce'], 'https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/{release-id}');
		assert.strictEqual(apt.virtualbox, 'https://mirrors.tuna.tsinghua.edu.cn/virtualbox/apt');
		assert.strictEqual(apt.nodesource, 'https://mirrors.tuna.tsinghua.edu.cn/nodesource/deb');
		assert.strictEqual(apt.main, 'https://mirrors.aliyun.com');
	});
	it('args', async () => {
		const opts = await config([
			'--apt-mirror=http://mirror.apt-mock.com',
			'--apt-nodesource-mirror=http://mirrors.apt-mock.com/nodesource'
		]);
		const apt = opts.apt;
		assert.strictEqual(apt.nodesource, 'http://mirrors.apt-mock.com/nodesource');
		assert.strictEqual(apt.main, 'http://mirror.apt-mock.com');
	});
});

describe('apt', () => {
	if (process.platform !== 'linux') {
		it.skip('Some tests were was skipped because they only support for linux', () => {});
		return;
	}
	if (/^(\d{2,}).(\d+)/.test(process.versions.node) && RegExp.$1 > 9 && RegExp.$2 > 4) {
		it.skip('Some tests were was skipped because `mock-fs` is not supported for node >= 10.5. See: https://github.com/tschaub/mock-fs/issues/238', () => {});
		return;
	}
	let apt;
	let mockFs = {};
	let mockCmd = [];
	const spawn = (...args) => {
		mockCmd.push(args);
		return Promise.resolve();
	};

	const sudo = {
		outputFile: (file, data) => {
			mockFs[file] = data;
			return Promise.resolve();
		},
		spawn: spawn,
		mock: true
	};

	before(() => {
		// platform = process.platform;

		apt = proxyquire('../lib/apt', {
			'./spawn': spawn,
			'./sudo': sudo
		});
		// process.platform = 'linux';
	});
	after(() => {
		mock.restore();
		// process.platform = platform;
	});
	afterEach(() => {
		mockFs = {};
		mockCmd = [];
	});

	it('unsupported linux distrib', async () => {
		mock({
			'/etc/lsb-release': `
DISTRIB_ID=mock_id
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=mock_codename
DISTRIB_DESCRIPTION="mock description"`
		});
		await apt({
			main: 'http://mirror.main.mock'
		});
		assert.ifError(mockFs['/etc/apt/sources.list']);
	});

	it('ubuntu creat /etc/apt/sources.list', async () => {
		mock({
			'/etc/lsb-release': `
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=mock
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
			`
		});
		await apt({
			main: 'http://mirror.main.mock'
		});

		assert.strictEqual(
			mockFs['/etc/apt/sources.list'].trim(),
			`
# Created by mirror-config-china
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb http://mirror.main.mock/ubuntu/ mock main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock main restricted universe multiverse
deb http://mirror.main.mock/ubuntu/ mock-updates main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-updates main restricted universe multiverse
deb http://mirror.main.mock/ubuntu/ mock-backports main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-backports main restricted universe multiverse
deb http://mirror.main.mock/ubuntu/ mock-security main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-security main restricted universe multiverse
# 预发布软件源，不建议启用
# deb http://mirror.main.mock/ubuntu/ mock-proposed main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-proposed main restricted universe multiverse
# End of mirror-config-china
			`.trim()
		);
	});

	it('ubuntu update /etc/apt/sources.list', async () => {
		mock({
			'/etc/lsb-release': `
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=mock
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
			`,
			'/etc/apt/sources.list': '## old sources'
		});
		await apt({
			main: 'http://mirror.main.mock'
		});

		assert.strictEqual(
			mockFs['/etc/apt/sources.list'].trim(),
			`
# Created by mirror-config-china
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb http://mirror.main.mock/ubuntu/ mock main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock main restricted universe multiverse
deb http://mirror.main.mock/ubuntu/ mock-updates main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-updates main restricted universe multiverse
deb http://mirror.main.mock/ubuntu/ mock-backports main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-backports main restricted universe multiverse
deb http://mirror.main.mock/ubuntu/ mock-security main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-security main restricted universe multiverse
# 预发布软件源，不建议启用
# deb http://mirror.main.mock/ubuntu/ mock-proposed main restricted universe multiverse
# deb-src http://mirror.main.mock/ubuntu/ mock-proposed main restricted universe multiverse
# End of mirror-config-china

## old sources
			`.trim()
		);
	});

	it('file not modified for debian /etc/apt/sources.list', async () => {
		const oldContents = `
# Created by mirror-config-china
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb http://mirror.main.mock/debian/ stretch main non-free contrib
# deb-src http://mirror.main.mock/debian/ stretch main non-free contrib
deb http://mirror.main.mock/debian-security/ stretch/updates main
# deb-src http://mirror.main.mock/debian-security/ stretch/updates main
deb http://mirror.main.mock/debian/ stretch-updates main non-free contrib
# deb-src http://mirror.main.mock/debian/ stretch-updates main non-free contrib
deb http://mirror.main.mock/debian/ stretch-backports main non-free contrib
# deb-src http://mirror.main.mock/debian/ stretch-backports main non-free contrib
# End of mirror-config-china
		`.trim() + '\n';
		mock({
			'/etc/os-release': `
PRETTY_NAME="Debian GNU/Linux 9 (stretch)"
NAME="Debian GNU/Linux"
VERSION_ID="9"
VERSION="9 (stretch)"
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"
			`,
			'/etc/apt/sources.list': oldContents
		});
		await apt({
			main: 'http://mirror.main.mock'
		});
		assert.ifError(mockFs['/etc/apt/sources.list']);
		const contents = await fs.readFile('/etc/apt/sources.list', 'utf8');
		assert.strictEqual(
			contents.trim(),
			oldContents.trim()
		);
	});

	it('create /etc/apt/sources.list.d/gitlab-runner.list', async () => {
		mock({
			'/etc/lsb-release': `
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=mock
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
			`
		});
		await apt({
			'gitlab-runner': 'https://mirrors.gitlab-runner.mock/gitlab-runner/{release-id}'
		});
		assert.strictEqual(
			mockFs['/etc/apt/sources.list.d/gitlab-runner.list'].trim(),
			`
# Created by mirror-config-china
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.gitlab-runner.mock/gitlab-runner/ubuntu/ mock main
# deb-src https://mirrors.gitlab-runner.mock/gitlab-runner/ubuntu/ mock main
# End of mirror-config-china
			`.trim()
		);
	});

	it('create nodesource', async () => {
		mock({
			'/etc/lsb-release': `
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=mock
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
			`
		});
		await apt({
			nodesource: 'http://mirror.nodesource.mock/deb'
		});
		assert.strictEqual(
			mockFs['/etc/apt/sources.list.d/nodesource.list'].trim(),
			`
# Created by mirror-config-china
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb http://mirror.nodesource.mock/deb_10.x/ mock main
# deb-src http://mirror.nodesource.mock/deb_10.x/ mock main
# End of mirror-config-china
			`.trim()
		);
	});

	it('update nodesource', async () => {
		mock({
			'/etc/lsb-release': `
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=mock
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
			`,
			'/etc/apt/sources.list.d/nodesource.list': `
deb https://deb.nodesource.com/node_8.x/ mock main
# deb-src https://deb.nodesource.com/node_8.x/ mock main
			`.trim() + '\n'
		});
		await apt({
			nodesource: 'http://mirror.nodesource.mock/deb'
		});
		assert.strictEqual(
			mockFs['/etc/apt/sources.list.d/nodesource.list'].trim(),
			`
# Created by mirror-config-china
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb http://mirror.nodesource.mock/deb_8.x/ mock main
# deb-src http://mirror.nodesource.mock/deb_8.x/ mock main
# End of mirror-config-china

deb https://deb.nodesource.com/node_8.x/ mock main
# deb-src https://deb.nodesource.com/node_8.x/ mock main
			`.trim()
		);
	});
});
