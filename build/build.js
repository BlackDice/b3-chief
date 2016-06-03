/* eslint-disable no-console */

import pkg from '../package.json';

import fs from 'fs-promise';
import Promise from 'any-promise';

import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';

const moduleName = 'chief';

async function execute() {
	await fs.ensureDir('dist').catch(() => true);
	await fs.emptyDir('dist').catch(() => true);

	await Promise.all([
		makeBundle(
			{ format: 'cjs', ext: '.js' },
		),
		makeBundle(
			{ format: 'es6', ext: '.mjs' }
		),
		makeBundle(
			{ format: 'cjs', ext: '.browser.js',
				babelPresets: ['es2015-rollup'],
				babelPlugins: ['transform-runtime'],
			}
		),
		makeBundle(
			{ format: 'umd', ext: '.full.js', moduleId: 'b3chief',
				babelPresets: ['es2015-rollup'],
				babelPlugins: ['transform-runtime', 'lodash'],
			}
		),
		writePackage(),
		fs.copy('LICENSE.txt', 'dist/LICENSE.txt'),
		fs.copy('README.md', 'dist/README.md'),
	]);
}

async function makeBundle(config) {
	const isUMD = config.format === 'umd';
	const inputConfig = {
		entry: 'src/index.js',
		plugins: [
			babel({
				babelrc: false,
				exclude: 'node_modules/**',
				presets: ['stage-1'].concat(config.babelPresets || []),
				plugins: config.babelPlugins || [],
			}),
			nodeResolve({ preferBuiltins: true, browser: isUMD }),
			commonJs(),
		],
	};

	if (isUMD) {

	} else {
		inputConfig.external = Object.keys(pkg.dependencies);
	}

	const outputConfig = {
		dest: `dist/${moduleName}${config.ext}`,
		format: config.format,
		sourceMap: !config.minify,
		moduleId: config.moduleId,
		moduleName,
	};

	const bundle = await rollup.rollup(inputConfig);
	await bundle.write(outputConfig);
	console.log('created', outputConfig.dest);
}

function writePackage() {
	Reflect.deleteProperty(pkg, 'private');
	Reflect.deleteProperty(pkg, 'devDependencies');
	Reflect.deleteProperty(pkg, 'scripts');
	Reflect.deleteProperty(pkg, 'babel');
	Reflect.deleteProperty(pkg, 'ava');
	Reflect.deleteProperty(pkg, 'nyc');
	return fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
}

console.log('building...');

execute()
	.then(() => console.log('finished'))
	.catch((err) => console.log(err.stack || err));
