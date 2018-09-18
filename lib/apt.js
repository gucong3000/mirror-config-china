'use strict';
const sudo = require('./sudo');
const path = require('path');
const got = require('got');
const fs = require('fs-extra');

function ubuntu (server, codename) {
	server = server.replace(/(?:\/ubuntu)?\/?$/, '/ubuntu/');
	return `
deb ${server} ${codename} main restricted universe multiverse
# deb-src ${server} ${codename} main restricted universe multiverse
deb ${server} ${codename}-updates main restricted universe multiverse
# deb-src ${server} ${codename}-updates main restricted universe multiverse
deb ${server} ${codename}-backports main restricted universe multiverse
# deb-src ${server} ${codename}-backports main restricted universe multiverse
deb ${server} ${codename}-security main restricted universe multiverse
# deb-src ${server} ${codename}-security main restricted universe multiverse
# 预发布软件源，不建议启用
# deb ${server} ${codename}-proposed main restricted universe multiverse
# deb-src ${server} ${codename}-proposed main restricted universe multiverse
	`;
}

function debian (server, codename) {
	server = server.replace(/(?:\/debian)?\/?$/, '/debian');
	return `
deb ${server}/ ${codename} main non-free contrib
# deb-src ${server}/ ${codename} main non-free contrib
deb ${server}-security/ ${codename}/updates main
# deb-src ${server}-security/ ${codename}/updates main
deb ${server}/ ${codename}-updates main non-free contrib
# deb-src ${server}/ ${codename}-updates main non-free contrib
deb ${server}/ ${codename}-backports main non-free contrib
# deb-src ${server}/ ${codename}-backports main non-free contrib
	`;
}

const tpl = {
	ubuntu,
	debian
};

const keys = {
	gitlab: 'https://packages.gitlab.com/gpg.key',
	nodesource: 'https://deb.nodesource.com/gpgkey/nodesource.gpg.key',
	docker: 'https://download.docker.com/linux/{release-id}/gpg',
	vbox: 'https://www.virtualbox.org/download/oracle_vbox_2016.asc'
};

const apt = {
	main: (release, mirror) => (
		updateSourcesList(
			'/etc/apt/sources.list',
			() => getSources(release, mirror)
		)
	),
	nodesource: (release, mirror) => (
		updateSourcesList(
			'/etc/apt/sources.list.d/nodesource.list',
			(oldSource) => {
				let version = oldSource && oldSource.match(/(?:^|\n)deb\s+\w+:\/\/[^/]+(?:\/\S+?)?\/\w+(_\d+\.\w+)?\/?(?=\s+|$)/);
				version = version ? version[1] || '' : '_10.x';
				mirror = mirror.replace(/\/*$/, `${version}/ ${release.codename} main`);
				return `deb ${mirror}\n# deb-src ${mirror}`;
			}
		)
	),
	default: (release, mirror, project) => (
		updateSourcesList(
			`/etc/apt/sources.list.d/${project}.list`,
			() => {
				mirror = mirror.replace(/\/*$/, `/ ${release.codename} main`);
				return `deb ${mirror}\n# deb-src ${mirror}`;
			}
		)
	)
};

let addKeys;

async function getRelease () {
	let releases = await fs.readdir('/etc');
	releases = await Promise.all(
		releases.filter(release => (
			/\brelease\b/.test(release)
		)).map(release => (
			fs.readFile('/etc/' + release, 'utf8').catch(() => {})
		))
	);

	const release = {};
	releases.filter(Boolean).forEach(contents => {
		contents.replace(/^(.+?)=('|")?(.+?)\2$/gm, (s, key, q, value) => {
			release[key] = value;
		});
	});
	return {
		id: release.ID || (release.DISTRIB_ID && release.DISTRIB_ID.toLowerCase()),
		codename: release.DISTRIB_CODENAME || release.VERSION_CODENAME || (release.VERSION && release.VERSION.replace(/^.*\(\s*(.*?)\s*\)$/, '$1')),
		version: release.VERSION_ID || release.DISTRIB_RELEASE
	};
}

function getSources (release, mirror) {
	const releaseId = release.id;
	if (!tpl[releaseId]) {
		return;
	}
	return tpl[releaseId](mirror, release.codename.toLowerCase());
}

async function updateSourcesList (file, getNewSources) {
	const warpSource = (oldSources) => {
		let newSources = getNewSources(oldSources);
		newSources = newSources && newSources.trim();
		if (!newSources) {
			return '';
		}
		return [
			'# Created by mirror-config-china',
			'# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释',
			newSources,
			'# End of mirror-config-china',
			'',
			''
		].join('\n');
	};
	let newSource;
	const oldSources = await fs.readFile(file, 'utf8').catch(() => {});
	if (oldSources) {
		newSource = oldSources
			.replace(/^# Created by mirror-config-china\n(.*?\n)*?# End of mirror-config-china\n+/gm, '');
		newSource = warpSource(newSource).trim();
		if (oldSources.trim() === newSource) {
			newSource = null;
		}
	} else {
		newSource = warpSource().trim();
	}
	if (newSource) {
		await sudo.outputFile(file, newSource + '\n');
	}
}

function strTpl (str, release) {
	return str.replace(/\{release-(\w+)\}/, (s, key) => (
		release[key] || s
	));
}

async function updateAptMirror (opts, release) {
	await Promise.all(
		Object.keys(opts).filter(project => opts[project]).map(project => {
			if (opts[project]) {
				const aptFn = apt[project] || apt.default;
				return aptFn(
					release,
					strTpl(opts[project], release),
					project
				);
			}
		})
	);
	if (!addKeys) {
		const warn = setTimeout(() => {
			console.warn('APT key 下载超时，建议使用代理，或者检查代理配置。');
		}, 0x3FFF);
		addKeys = (async () => {
			await Promise.all(
				Object.keys(keys).map((project) => (
					addAptKey(project, release)
				))
			);
			clearTimeout(warn);
		})();
	}
	await addKeys;

	await sudo.spawn(
		[
			'apt-get',
			'update'
		],
		{
			stdio: 'inherit',
			echo: true
		}
	);
}

async function updateApt (opts) {
	if (process.platform !== 'linux') {
		return;
	}
	const release = await getRelease();

	if (release.id && release.codename) {
		return updateAptMirror(opts, release);
	}
}

async function get (url, output) {
	const gpg = await got(url, {
		timeout: 0xffff
	});
	const oldContent = await fs.readFile(output, 'utf8');
	if (oldContent !== gpg.body) {
		const mtime = gpg.headers['last-modified'];
		await sudo.outputFile(output, gpg.body, mtime && new Date(mtime));
	}
}

async function addAptKey (project, release) {
	const file = path.join(__dirname, `../gpg/${project}.key`);
	try {
		await get(
			strTpl(keys[project], release),
			file
		);
	} catch (ex) {

	}

	const command = [
		'apt-key',
		'add',
		file
	];
	return sudo.spawn(
		command,
		{
			echo: true
		}
	);
}

module.exports = updateApt;
