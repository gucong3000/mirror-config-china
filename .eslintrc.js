
module.exports = {
	env: {
		browser: false,
		commonjs: true,
		es2021: true,
		node: true
	},
	extends: [
		'standard'
	],
	overrides: [
		{
			files: [
				'**/test/**/*'
			],
			env: {
				mocha: true
			},
			rules: {
			}
		}
	],
	parserOptions: {
		ecmaVersion: 'latest'
	},
	rules: {
		'prefer-arrow-callback': [
			'error'
		],
		'arrow-spacing': [
			'error',
			{
				after: true,
				before: true
			}
		],
		'comma-dangle': [
			'error'
			// 'always-multiline',
		],
		'comma-spacing': [
			'error',
			{
				after: true,
				before: false
			}
		],
		'eqeqeq': [
			'error',
			'smart'
		],
		'indent': [
			'error',
			'tab',
			{
				SwitchCase: 1
			}
		],
		'keyword-spacing': [
			'error',
			{
				after: true,
				before: true
			}
		],
		'no-console': [
			'off',
			{
			}
		],
		'no-tabs': [
			'off'
		],
		'object-shorthand': [
			'error',
			'never'
		],
		'quotes': [
			'error',
			'single',
			{
				allowTemplateLiterals: true,
				avoidEscape: true
			}
		],
		'quote-props': [
			'error',
			'consistent-as-needed'
		],
		'semi': [
			'error',
			'always',
			{
				omitLastInOneLineBlock: false
			}
		],
		'space-before-blocks': [
			'error',
			'always'
		],
		'space-infix-ops': [
			'error'
		],
		'spaced-comment': [
			'error',
			'always'
		],
		'strict': [
			'error',
			'safe'
		],
		'valid-jsdoc': [
			'warn',
			{
				requireReturn: false
			}
		]
	}
};
