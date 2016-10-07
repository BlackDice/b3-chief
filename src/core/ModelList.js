import t from 'tcomb'
import { oneLine } from 'common-tags'
import invariant from 'invariant'
import { hasOwnProperty, values } from './Object'

export default function initialize(Model, select) {
	const ModelType = Model.getModelType()

	const isModelInstance = (possibleInstance) => (
		t.Nil.is(possibleInstance) === false &&
		t.Function.is(possibleInstance.getModelType) &&
		ModelType === possibleInstance.getModelType()
	)

	const emptyCollection = Object.freeze({})
	const getCollection = () => select() || emptyCollection

	return {
		create(modelData, ...args) {
			return Model.create(modelData, ...args)
		},
		destroy(modelIdentity) {
			Model.destroy(modelIdentity)
		},
		get(modelIdentity) {
			if (isModelInstance(modelIdentity)) {
				return modelIdentity
			}

			const collection = getCollection()
			if (hasOwnProperty(collection, modelIdentity)) {
				return Model(modelIdentity)
			}
			return null
		},
		has(byValue, byPropertyName) {
			return this.get(byValue, byPropertyName) !== null
		},
		filter(byValue, byPropertyName) {
			const PropertyType = ModelType.meta.props[byPropertyName]

			invariant(PropertyType, oneLine`
				The model %s is missing requested property %s.
			`, Model, byPropertyName)

			invariant(PropertyType.is(byValue), oneLine`
				Value for property %s is expected to be of type %s.
			`, byPropertyName, PropertyType)

			return values(getCollection())
				.filter((item) => item[byPropertyName] === byValue)
				.map((item) => Model(item.id))
		},
		find(predicate) {
			const found = values(getCollection()).find((item) => predicate(Model(item.id)))
			if (found === undefined) {
				return null
			}
			return Model(found.id)
		},
		getAll() {
			return Object.keys(getCollection()).map((identity) => Model(identity))
		},
		attachCountProperty(target, propertyName) {
			Reflect.defineProperty(target, propertyName, {
				get: () => Object.keys(getCollection()).length,
			})
		},
	}
}
