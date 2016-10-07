/* eslint-disable no-console,import/no-extraneous-dependencies,object-property-newline */

import fs from 'fs-promise'
import Promise from 'any-promise'

import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonJs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

import pkg from '../package.json'

const moduleName = 'chief'

const babelConfig = {
	babelrc: false,
	exclude: 'node_modules/**',
	presets: [['es2015', { modules: false }], 'stage-1'],
	plugins: [
		'dev-expression',
		'external-helpers',
		'transform-flow-strip-types',
	],
}

function execute() {
	return fs.ensureDir('dist').catch(Boolean)
	.then(() => fs.emptyDir('dist').catch(Boolean))
	.then(() => Promise.all([
		makeBundle(
			{ format: 'es', ext: '.mjs', package: 'jsnext:main' }
		),
		makeBundle(
			{ format: 'cjs', ext: '.js', package: 'main' },
		),
		makeBundle(
			{ format: 'umd', ext: '.umd.js', package: 'browser', moduleId: 'b3chief' }
		),
		makeBundle(
			{ format: 'umd', ext: '.umd.min.js', moduleId: 'b3chief', minify: true	}
		),
		fs.copy('LICENSE.txt', 'dist/LICENSE.txt'),
		fs.copy('README.md', 'dist/README.md'),
	]).then(writePackage))
}

function makeBundle(config) {
	const isUMD = config.format === 'umd'

	const finalBabelConfig = {
		...babelConfig,
		presets: babelConfig.presets.concat(config.babelPresets || []),
		plugins: babelConfig.plugins.concat(config.babelPlugins || []),
	}

	const inputConfig = {
		entry: 'src/index.js',
		plugins: [
			babel(finalBabelConfig),
			nodeResolve({
				browser: isUMD, preferBuiltins: !isUMD,
			}),
			commonJs({ include: 'node_modules/**', ignoreGlobal: true }),
		],
	}

	if (isUMD) {
		inputConfig.plugins.push(replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}))
	} else {
		inputConfig.external = [].concat(
			Object.keys(pkg.dependencies),
			Object.keys(pkg.optionalDependencies),
		)
	}

	if (config.minify) {
		inputConfig.plugins.push(uglify())
	}

	const outputConfig = {
		dest: `dist/${moduleName}${config.ext}`,
		format: config.format,
		sourceMap: !config.minify,
		moduleId: config.moduleId,
		moduleName: config.moduleId || moduleName,
	}

	return rollup(inputConfig).then((bundle) => {
		bundle.write(outputConfig)

		console.log('created', outputConfig.dest)

		if (config.package) {
			return { [config.package]: `${moduleName}${config.ext}` }
		}

		return null
	})
}

function writePackage(mainfiles) {
	Reflect.deleteProperty(pkg, 'private')
	Reflect.deleteProperty(pkg, 'devDependencies')
	Reflect.deleteProperty(pkg, 'scripts')
	Reflect.deleteProperty(pkg, 'babel')
	Reflect.deleteProperty(pkg, 'ava')
	Reflect.deleteProperty(pkg, 'nyc')
	for (const mainfile of mainfiles) {
		if (mainfile !== null) {
			Object.assign(pkg, mainfile)
		}
	}
	return fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8')
}

console.log('building...')

execute()
	.then(() => console.log('finished'))
	.catch((err) => console.log(err.stack || err))
