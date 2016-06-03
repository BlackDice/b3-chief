/* eslint-disable */

var babelPlugins = require('./babelplugins');

module.exports = {
	plugins: babelPlugins(process.version),
	presets: ['stage-1'],
	env: {
		development: {
			sourceMap: 'inline'
		}
	}
};
