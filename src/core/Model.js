import { compose, methods } from 'stampit'
import invariant from 'invariant'
import { oneLine } from 'common-tags'
import upperFirst from 'lodash.upperfirst'
import isFunction from 'tcomb/lib/isFunction'
import { hasOwnProperty } from './Object'

const identityProperty = 'id'

const DefaultAdapter = methods({
	set() {
		throw new Error(`No setter has been defined for model ${this.getModelName()}`)
	},
}).conf({
	readonly: [identityProperty],
})

function Model(ModelType, Adapter) {
	const ModelAdapter = methods({
		get(property, dataSource) {
			const modelData = dataSource()

			invariant(modelData !== undefined, oneLine`
				No data retrieved for %s. It might have been already removed from the state.
			`, this.identity)
			ModelType(modelData)

			return hasOwnProperty(modelData, property) ? modelData[property] : null
		},
	}).compose(DefaultAdapter, Adapter)

	const { props } = ModelType.meta
	const { readonly } = ModelAdapter.compose.configuration
	const adapter = ModelAdapter.create()

	const modelMethods = Object.keys(props).reduce((result, propName) => (
		{ ...result, ...createModelMethods(propName, adapter, readonly.includes(propName)) }
	), {
		valueOf() {
			return this.dataSource()
		},
		toString() {
			return `model of ${this.getModelName()}`
		},
		validateDataSource,
		getModelName,
		getModelType,
	})

	function validateDataSource(dataSource) {
		ModelType(dataSource())
	}

	function getModelName() {
		return ModelType.meta.name
	}

	function getModelType() {
		return ModelType
	}

	function initializeModel(identity) {
		Reflect.defineProperty(this, 'identity', { value: identity })

		this.dataSource = () => {
			throw new Error(`No data source has been defined for model ${this.getModelName()}`)
		}
	}

	return compose({
		init: initializeModel,
		methods: modelMethods,
		statics: {
			validateDataSource,
			getModelName,
			getModelType,
			getPropertyMethodName,
		},
	})
}

function createModelMethods(name, adapter, isReadonly) {
	if (isReadonly) {
		return createGetter(name, adapter)
	}
	return {
		...createGetter(name, adapter),
		...createSetter(name, adapter),
	}
}

function createGetter(name, adapter) {
	const getterName = getPropertyMethodName(name, 'get')

	const adapterGetter = adapter[getterName]
	const getter = isFunction(adapterGetter)
		? function getter() {
			return Reflect.apply(adapterGetter, this, [this.dataSource])
		}
		: function getter() {
			return Reflect.apply(adapter.get, this, [name, this.dataSource])
		}


	getter.displayName = getterName
	return { [getterName]: getter }
}

function createSetter(name, adapter) {
	const setterName = getPropertyMethodName(name, 'set')

	const adapterSetter = adapter[setterName]
	const setter = function setter(value) {
		if (isFunction(adapterSetter)) {
			Reflect.apply(adapterSetter, this, [value, this.dataSource])
		}
		Reflect.apply(adapter.set, this, [name, value])
	}

	setter.displayName = setterName
	return { [setterName]: setter }
}

function getPropertyMethodName(name, prefix = '') {
	return `${prefix}${upperFirst(name)}`
}

export default Model
