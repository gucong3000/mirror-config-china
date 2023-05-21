'use strict';
module.exports = {
	env: {
		browser: false,
		es6: true,
		node: true,
	},
	extends: [
		'standard',
	],
	parserOptions: {
		sourceType: 'script',
	},
	root: true,
	rules: {
		'prefer-arrow-callback': [
			'error',
		],
		'arrow-spacing': [
			'error',
			{
				after: true,
				before: true,
			},
		],
		'comma-dangle': [
			'error',
			'always-multiline',
		],
		'comma-spacing': [
			'error',
			{
				after: true,
				before: false,
			},
		],
		eqeqeq: [
			'error',
			'smart',
		],
		indent: [
			'warn',
			'tab',
			{
				SwitchCase: 1,
			},
		],
		'keyword-spacing': [
			'error',
			{
				after: true,
				before: true,
			},
		],
		'no-console': [
			'off',
			{
			},
		],
		'no-tabs': [
			'off',
		],
		quotes: [
			'error',
			'single',
			{
				allowTemplateLiterals: true,
				avoidEscape: true,
			},
		],
		semi: [
			'error',
			'always',
			{
				omitLastInOneLineBlock: false,
			},
		],
		'space-before-blocks': [
			'error',
			'always',
		],
		'space-infix-ops': [
			'error',
		],
		'spaced-comment': [
			'error',
			'always',
		],
		strict: [
			'error',
			'safe',
		],
		'valid-jsdoc': [
			'warn',
			{
				requireReturn: false,
			},
		],
	},
	overrides: [
		{
			files: [
				'**/test/**/*',
			],
			env: {
				mocha: true,
			},
			rules: {
				'no-unused-expressions': 'off',
				'no-template-curly-in-string': 'off',
			},
		},
	],
};
