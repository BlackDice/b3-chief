import _upperFirst from 'lodash.upperfirst';
import _isFunction from 'lodash.isfunction';
import stampit from 'stampit';

import EventEmittable from '../core/EventEmittable';
import Private from '../core/Private';

export const ModelPrivate = Private.methods({
	getProperty(owner, propertyName) {
		return this.get(owner, 'props')[propertyName];
	},
	setProperty(owner, propertyName, propertyValue) {
		const props = this.get(owner, 'props');
		props[propertyName] = propertyValue;
	},
});

function Model(modelName, privates = ModelPrivate.create()) {

	function initializeModelPrivateArea() {
		privates.init(this);
		privates.set(this, 'props', {});
	}

	const getter = setupPropertyAccessor(privates, true);
	const property = setupPropertyAccessor(privates);

	function valueOf() {
		return Object.assign({}, privates.get(this, 'props'));
	}

	const properties = {
		get() {
			return Object.keys(privates.get(this, 'props'));
		},
	};

	function toString() {
		return `model of ${modelName}`;
	}

	function getModelName() {
		return modelName;
	}

	return stampit.compose(EventEmittable, {
		initializers: [initializeModelPrivateArea],
		methods: { getModelName, toString, valueOf },
		staticProperties: { getter, property },
		staticPropertyDescriptors: { properties },
	});
}

function setupPropertyAccessor(privates, readonly = false) {
	return function accessProperty(propertyName, defaultValue = null) {

		const methodSuffix = _upperFirst(propertyName);
		const methods = {};

		methods[`get${methodSuffix}`] = function getPropertyValue() {
			return privates.getProperty(this, propertyName);
		};

		function setPropertyValue(newValue) {
			const oldValue = privates.getProperty(this, propertyName);
			privates.setProperty(this, propertyName, newValue);
			this.emit('change', propertyName, newValue, oldValue);
		}

		if (readonly !== true) {
			methods[`set${methodSuffix}`] = setPropertyValue;
		}

		function initializePropertyValue(data) {
			if (data && data.hasOwnProperty(propertyName)) {
				privates.setProperty(this, propertyName, data[propertyName]);
			} else if (_isFunction(defaultValue)) {
				const obtainedValue = Reflect.apply(defaultValue, this, [data]);
				privates.setProperty(this, propertyName, obtainedValue);
			}
		}

		return this.compose({
			deepConfiguration: { properties: [propertyName]},
			methods, initializers: [initializePropertyValue],
		});
	};
}

export default Model;
