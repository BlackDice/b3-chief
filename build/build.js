/* eslint-disable */

'use strict';

var fs = require('fs');
var del = require('del');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var uglify = require('rollup-plugin-uglify');
var Promise = require('any-promise');
var pkg = require('../package.json');

var bundles = [
	{
		format: 'cjs', ext: '.js', plugins: [],
		babelPresets: ['stage-1'], babelPlugins: [
			'transform-es2015-destructuring',
			'transform-es2015-function-name',
			'transform-es2015-parameters',
		],
	},
	{
		format: 'es6', ext: '.mjs', plugins: [],
		babelPresets: ['stage-1'], babelPlugins: [
			'transform-es2015-destructuring',
			'transform-es2015-function-name',
			'transform-es2015-parameters',
		],
	},
	{
		format: 'cjs', ext: '.browser.js', plugins: [],
		babelPresets: ['es2015-rollup', 'stage-1'], babelPlugins: [],
	},
];

var promise = Promise.resolve();

// Compile source code into a distributable format with Babel and Rollup
bundles.forEach(function(config) {
	var inputConfig = {
		entry: 'src/index.js',
		external: Object.keys(pkg.dependencies),
		plugins: [
			babel({
				babelrc: false,
				exclude: 'node_modules/**',
				presets: config.babelPresets,
				plugins: config.babelPlugins,
				runtimeHelpers: true,
			}),
			require('rollup-plugin-node-resolve')({
				preferBuiltins: true
			}),
			require('rollup-plugin-commonjs')()
		].concat(config.plugins),
	};

	var outputConfig = {
		dest: 'dist/' + (config.moduleName || 'main') + config.ext,
		format: config.format,
		sourceMap: !config.minify,
		moduleName: config.moduleName,
	};

	promise = promise.then(function() {
		return rollup.rollup(inputConfig);
	}).then(function(bundle) {
		return bundle.write(outputConfig);
	});
});

// Copy package.json and LICENSE.txt
promise = promise.then(function() {
	Reflect.deleteProperty(pkg, 'private');
	Reflect.deleteProperty(pkg, 'devDependencies');
	Reflect.deleteProperty(pkg, 'scripts');
	Reflect.deleteProperty(pkg, 'eslintConfig');
	Reflect.deleteProperty(pkg, 'babel');
	Reflect.deleteProperty(pkg, 'ava');
	Reflect.deleteProperty(pkg, 'nyc');
	fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
	fs.writeFileSync('dist/LICENSE.txt', fs.readFileSync('LICENSE.txt', 'utf-8'), 'utf-8');
	fs.writeFileSync('dist/README.md', fs.readFileSync('README.md', 'utf-8'), 'utf-8');
});

promise.catch(function(err) {
	console.error(err.stack); // eslint-disable-line no-console
});
