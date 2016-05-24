import stampit from 'stampit';
import purdy from 'purdy';

export const Inspect = stampit.staticProperties({
	inspector() {
		console.log(this.compose.methods);
		return this;
	},
});
