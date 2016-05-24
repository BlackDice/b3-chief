'use strict';

const fs = require('fs');
const del = require('del');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const nodeResolve = require('rollup-plugin-node-resolve');
const pkg = require('../package.json');

const bundles = [
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
	{
		format: 'umd', ext: '.js', plugins: [],
		babelPresets: ['es2015-rollup', 'stage-1'], babelPlugins: [],
		moduleName: 'b3chief',
	},
	{
		format: 'umd', ext: '.min.js', plugins: [uglify()],
		babelPresets: ['es2015-rollup', 'stage-1'], babelPlugins: [],
		moduleName: 'b3chief', minify: true,
	},
];

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(['dist/*']));

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
	promise = promise.then(() => rollup.rollup({
		entry: 'src/index.js',
		external: Object.keys(pkg.dependencies),
		plugins: [
			babel({
				babelrc: false,
				exclude: 'node_modules/**',
				presets: config.babelPresets,
				plugins: config.babelPlugins,
			}),
			nodeResolve({ preferBuiltins: true }),
		].concat(config.plugins),
	}).then((bundle) => bundle.write({
		dest: `dist/${config.moduleName || 'main'}${config.ext}`,
		format: config.format,
		sourceMap: !config.minify,
		moduleName: config.moduleName,
	})));
}

// Copy package.json and LICENSE.txt
promise = promise.then(() => {
	Reflect.deleteProperty(pkg, 'private');
	Reflect.deleteProperty(pkg, 'devDependencies');
	Reflect.deleteProperty(pkg, 'scripts');
	Reflect.deleteProperty(pkg, 'eslintConfig');
	Reflect.deleteProperty(pkg, 'babel');
	Reflect.deleteProperty(pkg, 'ava');
	Reflect.deleteProperty(pkg, 'nyc');
	fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
	fs.writeFileSync('dist/LICENSE.txt', fs.readFileSync('LICENSE.txt', 'utf-8'), 'utf-8');
});

promise.catch((err) => console.error(err.stack)); // eslint-disable-line no-console
