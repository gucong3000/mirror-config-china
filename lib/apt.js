'use strict';
const spawn = require('./spawn');
const sudo = require('./sudo');
const path = require('path');
const fs = require('fs-extra');

let wget;

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
	ubuntu: ubuntu,
	debian: debian
};

const keys = {
	gitlab: 'https://packages.gitlab.com/gpg.key',
	nodesource: 'https://deb.nodesource.com/gpgkey/nodesource.gpg.key',
	docker: 'https://download.docker.com/linux/debian/gpg',
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

function getRelease () {
	return fs.readdir('/etc').then(releases => (
		Promise.all(
			releases.filter(release => (
				/\brelease\b/.test(release)
			)).map(release => (
				fs.readFile('/etc/' + release, 'utf8').catch(() => {})
			))
		)
	)).then(releases => {
		const release = {};
		releases.filter(Boolean).forEach(contents => {
			contents.replace(/^(.+?)=('|")?(.+?)\2$/gm, (s, key, q, value) => {
				release[key] = value;
			});
		});
		return {
			id: release.ID || release.DISTRIB_ID.toLowerCase(),
			codename: release.DISTRIB_CODENAME || release.VERSION_CODENAME || release.VERSION.replace(/^.*\(\s*(.*?)\s*\)$/, '$1'),
			version: release.VERSION_ID || release.DISTRIB_RELEASE
		};
	});
}

function getSources (release, mirror) {
	const releaseId = release.id;
	if (!tpl[releaseId]) {
		return;
	}
	return tpl[releaseId](mirror, release.codename.toLowerCase());
}

function updateSourcesList (file, getNewSources) {
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
	return fs.readFile(file, 'utf8').then(oldSources => {
		let newSource = oldSources
			.replace(/^# Created by mirror-config-china\n(.*?\n)*?# End of mirror-config-china\n+/gm, '');
		newSource = (warpSource(newSource) + newSource).trim();
		if (oldSources.trim() !== newSource) {
			return newSource;
		}
	}, () => (
		warpSource().trim()
	)).then(newSources => {
		if (newSources) {
			return sudo.outputFile(file, newSources + '\n');
		}
	});
}

function updateAptMirror (opts, release) {
	return Promise.all(
		Object.keys(opts).filter(project => opts[project]).map(project => {
			if (opts[project]) {
				const aptFn = apt[project] || apt.default;
				return aptFn(
					release,
					opts[project].replace(/\{release-(\w+)\}/, (s, key) => (
						release[key] || s
					)),
					project
				);
			}
		})
	).then(() => {
		if (!addKeys) {
			addKeys = Promise.all(Object.keys(keys).map(addAptKey));
		}
		return addKeys;
	}).then(() => (
		sudo.spawn(
			[
				'apt-get',
				'update'
			],
			{
				stdio: 'inherit',
				echo: true
			}
		)
	));
}

function updateApt (opts) {
	if (process.platform !== 'linux') {
		return;
	}

	return getRelease().then(release => {
		if (release.id && release.codename) {
			return updateAptMirror(opts, release);
		}
	});
}

function get (url, output) {
	if (!wget) {
		wget = spawn(
			[
				'which',
				'wget'
			],
			{
				stdio: 'ignore'
			}
		).then(() => true, () => false);
	}
	return wget.then(wget => {
		const args = wget
			? [
				'wget',
				'--output-document=' + output,
				'--timestamping',
				url
			]
			: [
				'curl',
				'--output',
				output,
				'--remote-time',
				'--location',
				output
			];
		return spawn(
			args,
			{
				echo: true,
				stdio: [
					'ignore',
					'ignore',
					'pipe'
				]
			}
		);
	});
}

function addAptKey (project) {
	const file = path.join(__dirname, `../gpg/${project}.key`);
	return get(
		keys[project],
		file
	).catch(() => {}).then(() => {
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
	});
}

module.exports = updateApt;
