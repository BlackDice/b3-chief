import { compose } from 'stampit'
import { oneLine } from 'common-tags'
import invariant from 'invariant'

import { MemoryKey, MemoryValue } from './types'

import Disposable from './core/Disposable'

const MemoryModel = compose(
	Disposable, {
		init: initializeMemoryModel,
	},
)

function initializeMemoryModel({ store, subjectId, memoryId }) {
	invariant(store, oneLine`
		Memory model is expecting store instance
	`)

	invariant(subjectId, oneLine`
		Memory model is expecting subjectId
	`)

	invariant(memoryId, oneLine`
		Memory model is expecting memoryId
	`)

	let select = null

	this.get = (key?: MemoryKey) => {
		if (select === null) {
			select = store.select(store.selectors.memory)
		}
		const memory = select(subjectId, memoryId)
		if (memory === null) {
			return null
		}
		if (key === undefined) {
			return memory
		}
		return memory[key] || null
	}

	this.set = (key: MemoryKey, value: MemoryValue) => {
		store.actions.setMemory({
			subjectId,
			memoryId,
			key,
			value,
		})
	}

	this.unset = (key: MemoryKey) => {
		store.actions.unsetMemory({
			subjectId,
			memoryId,
			key,
		})
	}

	this.destroy = () => {
		store.actions.removeMemory({
			subjectId,
			memoryId,
		})
	}

	Reflect.defineProperty(this, 'memoryId', { value: memoryId })
}

export default MemoryModel
