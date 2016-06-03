import stampit from 'stampit';
import EventEmitter from 'events';

const EventEmittable = stampit({
	initializers: function initEventEmitter() {
		Reflect.apply(EventEmitter, this, []);
	},
	methods: ['emit', 'on', 'once', 'removeListener'].reduce((methods, methodName) => {
		methods[methodName] = EventEmitter.prototype[methodName];
		return methods;
	}, {}),
});

export default EventEmittable;
