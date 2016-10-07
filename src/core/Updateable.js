import stampit from 'stampit'

import Disposable from './Disposable'

const Updatable = stampit()
	.compose(Disposable)
	.init(initializeUpdatable)


function initializeUpdatable() {
	const updateHandlers = new Set()

	this.didUpdate = (type, payload) => {
		const update = { type, payload, target: this }
		updateHandlers.forEach((handler) => {
			Reflect.apply(handler, this, [update])
		})
	}

	this.onUpdate = (fn) => {
		updateHandlers.add(fn)
		return () => updateHandlers.delete(fn)
	}

	this.onDispose(() => {
		updateHandlers.clear()
	})
}

export default Updatable
