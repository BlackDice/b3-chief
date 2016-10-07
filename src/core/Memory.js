import { compose } from 'stampit'
import invariant from 'invariant'
import warning from 'warning'
import { oneLine } from 'common-tags'
import upperFirst from 'lodash.upperfirst'
import isString from 'tcomb/lib/isString'
import isFunction from 'tcomb/lib/isFunction'
import isObject from 'tcomb/lib/isObject'

import { hasOwnProperty } from './Object'
import EventEmittable from './EventEmittable'

const Memory = compose(
	EventEmittable, {
		init: [initializeMemory, initializeSubmemories],
		deepConf: { defaults: {}, submemories: {}},
		statics: { withSubmemory, withDefaults },
	},
)

function withSubmemory(name, submemory) {
	return this.deepConf({ submemories: { [name]: submemory }})
}

function withDefaults(defaults) {
	return this.deepConf({ defaults })
}

function initializeMemory(data, { stamp }) {
	const { defaults } = stamp.compose.deepConfiguration

	let memoryMap = {}

	this.get = (key) => {
		invariant(isString(key) && key.length,
			'The get() method of memory is expecting string key to be specified.'
		)

		if (hasOwnProperty(memoryMap, key)) {
			return memoryMap[key]
		}

		if (hasOwnProperty(data, key)) {
			return data[key]
		}

		if (hasOwnProperty(defaults, key)) {
			const defaultValue = defaults[key]

			if (isFunction(defaultValue)) {
				const value = Reflect.apply(defaultValue, this, [key])

				// value is stored to map so same value can be retrieved on next get() call
				memoryMap[key] = value
				return value
			}

			warning(!isObject(defaultValue), oneLine`
				Default value specified for key '%s' is an object and would used by reference.
				Use function that returns new object for each memory to solve this.
				Specified value of type '%s'
			`, key, typeof defaultValue)

			return defaultValue
		}
		return null
	}

	this.set = (key, value) => {
		const previousValue = memoryMap[key]
		memoryMap[key] = value
		this.emit('change', { key, value, previousValue })
	}

	this.forget = () => {
		this.emit('forget')
		memoryMap = {}
	}

	this.dump = () => ({ ...data, ...memoryMap })
}

function initializeSubmemories(data, { stamp }) {
	const { submemories } = stamp.compose.deepConfiguration

	const attachSubmemory = (name, submemoryFactory) => {
		let submemoryMap = {}

		const createSubmemory = (identifier) => {
			const createdSubmemory = submemoryFactory()
			submemoryMap[identifier] = createdSubmemory
			return createdSubmemory
		}

		const accessSubmemory = (identifier) => {
			invariant(isString(identifier) && identifier.length, oneLine`
				Accessing submemory '%s' requires string identifier specified.
			`, name)

			const submemory = submemoryMap[identifier]
			if (submemory === undefined) {
				return createSubmemory(identifier)
			}
			return submemory
		}

		const listSubmemory = () => Object.keys(submemoryMap)

		const forgetSubmemory = () => {
			for (const identifier of listSubmemory()) {
				const submemory = submemoryMap[identifier]
				if (submemory !== undefined) {
					submemory.forget()
				}
			}
			submemoryMap = {}
		}

		const upperName = upperFirst(name)
		this[`access${upperName}`] = accessSubmemory
		this[`list${upperName}`] = listSubmemory
		this[`forget${upperName}`] = forgetSubmemory
		this.on('forget', forgetSubmemory)
	}

	for (const name of Object.keys(submemories)) {
		attachSubmemory(name, submemories[name])
	}
}

export default Memory

