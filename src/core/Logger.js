import stampit from 'stampit';
import debug from 'debug';

const Logger = stampit.methods({
	debug(category, ...args) {
		debug(`b3:chief:${category}`)(...args);
	},
});

export default Logger;
