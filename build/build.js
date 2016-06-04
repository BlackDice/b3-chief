/* eslint-disable no-console */

import pkg from '../package.json';

import fs from 'fs-promise';
import Promise from 'any-promise';

import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

const moduleName = 'chief';

const babelConfig = {
	babelrc: false,
	exclude: 'node_modules/**',
	presets: ['stage-1'],
	plugins: ['dev-expression'],
	runtimeHelpers: true,
};

async function execute() {
	await fs.ensureDir('dist').catch(() => true);
	await fs.emptyDir('dist').catch(() => true);

	await Promise.all([
		makeBundle(
			{ format: 'es6', ext: '.mjs', package: 'jsnext:main',
				babelPlugins: ['external-helpers'],
			}
		),
		makeBundle(
			{ format: 'cjs', ext: '.js', package: 'main',
				babelPlugins: ['external-helpers'],
			},
		),
		makeBundle(
			{ format: 'cjs', ext: '.browser.js', package: 'browser',
				babelPresets: ['es2015-rollup'],
			}
		),
		makeBundle(
			{ format: 'umd', ext: '.full.js', moduleId: 'b3chief',
				babelPresets: ['es2015-rollup'],
				babelPlugins: ['lodash'],
			}
		),
		makeBundle(
			{ format: 'umd', ext: '.full.min.js', moduleId: 'b3chief', minify: true,
				babelPresets: ['es2015-rollup'],
				babelPlugins: ['lodash'],
			}
		),
		fs.copy('LICENSE.txt', 'dist/LICENSE.txt'),
		fs.copy('README.md', 'dist/README.md'),
	]).then(writePackage);
}

async function makeBundle(config) {
	const isUMD = config.format === 'umd';

	const localBabelConfig = {
		...babelConfig,
		presets: babelConfig.presets.concat(config.babelPresets || []),
		plugins: babelConfig.plugins.concat(config.babelPlugins || []),
	};

	const inputConfig = {
		entry: 'src/index.js',
		plugins: [
			babel(localBabelConfig),
			nodeResolve({
				jsnext: true, main: true, browser: isUMD, preferBuiltins: !isUMD,
			}),
			commonJs({ ignoreGlobal: true }),
		],
	};

	if (isUMD) {
		inputConfig.external = ['babel-polyfill'];
	} else {
		inputConfig.external = Object.keys(pkg.dependencies);
	}

	if (config.minify) {
		inputConfig.plugins.push(uglify());
	}

	const outputConfig = {
		dest: `dist/${moduleName}${config.ext}`,
		format: config.format,
		sourceMap: !config.minify,
		moduleId: config.moduleId,
		moduleName: config.moduleId || moduleName,
		globals: {
			'babel-polyfill': '_babelPolyfill',
		},
	};

	const bundle = await rollup.rollup(inputConfig);
	await bundle.write(outputConfig);
	console.log('created', outputConfig.dest);

	if (config.package) {
		return { [config.package]: `${moduleName}${config.ext}` };
	}

	return null;
}

function writePackage(mainfiles) {
	Reflect.deleteProperty(pkg, 'private');
	Reflect.deleteProperty(pkg, 'devDependencies');
	Reflect.deleteProperty(pkg, 'scripts');
	Reflect.deleteProperty(pkg, 'babel');
	Reflect.deleteProperty(pkg, 'ava');
	Reflect.deleteProperty(pkg, 'nyc');
	for (const mainfile of mainfiles) {
		if (mainfile !== null) {
			Object.assign(pkg, mainfile);
		}
	}
	return fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
}

console.log('building...');

execute()
	.then(() => console.log('finished'))
	.catch((err) => console.log(err.stack || err));
