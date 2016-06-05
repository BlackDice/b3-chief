import stampit from 'stampit';
import debug from 'debug';

const Logger = stampit.methods({
	debug(category, ...args) {
		debug(`chief:${category}`)(...args);
	},
});

export default Logger;
