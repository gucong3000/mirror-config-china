'use strict';
const TAOBAO_MIRRORS = 'http://npm.taobao.org/mirrors/';
const MIRRORS =  {
	CHROMEDRIVER_CDNURL: `${ TAOBAO_MIRRORS }chromedriver`,
	ELECTRON_MIRROR: `${ TAOBAO_MIRRORS }electron/`,
	GIT4WIN_MIRROR: `${ TAOBAO_MIRRORS }git-for-windows`,
	NVMW_NPM_MIRROR: `${ TAOBAO_MIRRORS }npm`,
	PHANTOMJS_CDNURL: `${ TAOBAO_MIRRORS }phantomjs`,
	PYTHON_MIRROR: `${ TAOBAO_MIRRORS }python`,
	SASS_BINARY_SITE: `${ TAOBAO_MIRRORS }node-sass`,
	SQLITE3_BINARY_SITE: `${ TAOBAO_MIRRORS }sqlite3`,
	OPERADRIVER_CDNURL: `${ TAOBAO_MIRRORS }operadriver`
};

function repeat(keys, value) {
	keys.forEach(key => {
		MIRRORS[key] = value;
	});
}

repeat(
	[
		'IOJS_ORG_MIRROR',
		'NVM_IOJS_ORG_MIRROR',
		'NVMW_IOJS_ORG_MIRROR',
		'NODIST_IOJS_MIRROR'
	],
	`${ TAOBAO_MIRRORS }iojs`
);

repeat(
	[
		'NODEJS_ORG_MIRROR',
		'NVM_NODEJS_ORG_MIRROR',
		'NVMW_NODEJS_ORG_MIRROR',
		'NODIST_NODE_MIRROR',
	],
	`${ TAOBAO_MIRRORS }node`
);

module.exports = MIRRORS;
