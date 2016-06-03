/* eslint-disable */

var nodePlugins = {
	'<= 4.x': [
		'transform-es2015-spread',
		'transform-async-to-generator',
	],
	'<= 5.x': [
		'transform-es2015-destructuring',
		'transform-es2015-function-name',
		'transform-es2015-parameters',
		'transform-es2015-shorthand-properties',
		'transform-es2015-sticky-regex',
		'transform-es2015-unicode-regex',
		'transform-runtime',
	],
	'<= 6.x': [
		'transform-object-rest-spread',
		'transform-es2015-modules-commonjs',
	],
};

var semver = require('semver');

function getPluginsFor(version) {
	var plugins = [
		'dev-expression'
	];
	if (version === undefined || semver.satisfies(version, '< 1.x')) {
		var preset = require('babel-preset-es2015');
		plugins.push.apply(plugins, preset.plugins);
		return plugins;
	}
	for (var nodeVersion in nodePlugins) {
		if (semver.satisfies(version, nodeVersion)) {
			plugins.push.apply(plugins, nodePlugins[nodeVersion]);
		}
	}
	return plugins;
}

module.exports = getPluginsFor;
