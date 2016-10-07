import stampit from 'stampit'
import EventEmitter from 'events'

const EventEmittable = stampit({
	initializers: function initEventEmitter() {
		Reflect.apply(EventEmitter, this, [])
	},
	methods: ['emit', 'on', 'once', 'removeListener', 'removeAllListeners'].reduce(useMethod, {}),
})

function useMethod(methods, methodName) {
	return { ...methods, [methodName]: EventEmitter.prototype[methodName] }
}

export default EventEmittable
