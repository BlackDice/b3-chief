import stampit from 'stampit'
import invariant from 'invariant'
import warning from 'warning'

const Disposable = stampit().init(initializeDisposable)

function initializeDisposable() {
	let isDisposed = false

	Reflect.defineProperty(this, 'isDisposed', { get: () => isDisposed })

	const disposeHandlers = new Set()

	this.dispose = () => {
		invariant(isDisposed === false, 'Object %s has been already disposed', this)
		warning(disposeHandlers.size,
			'No dispose handlers has been registered with onDispose method for %s.'
		, this)

		disposeHandlers.forEach((handler) => {
			Reflect.apply(handler, this, [])
		})

		disposeHandlers.clear()

		isDisposed = true
	}

	this.onDispose = (fn) => {
		disposeHandlers.add(fn)
		return () => disposeHandlers.delete(fn)
	}
}

export default Disposable
