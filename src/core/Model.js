import { upperFirst, isFunction } from 'lodash';
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

	const data = { get: valueOf };

	function toString() {
		return `model of ${modelName}`;
	}

	function getModelName() {
		return modelName;
	}

	return stampit.compose(EventEmittable, {
		initializers: [initializeModelPrivateArea],
		methods: { getModelName, toString, valueOf },
		propertyDescriptors: { data },
		staticProperties: { getter, property },
	});
}

function setupPropertyAccessor(privates, readonly = false) {
	return function accessProperty(propertyName, defaultValue = null) {

		const methodSuffix = upperFirst(propertyName);
		const methods = {};

		methods[`get${methodSuffix}`] = function getPropertyValue() {
			return privates.getProperty(this, propertyName);
		};

		function setPropertyValue(newValue) {
			const oldValue = privates.getProperty(this, propertyName);
			privates.setProperty(this, propertyName, newValue);
			this.emit('change', { propertyName, newValue, oldValue });
		}

		if (readonly !== true) {
			methods[`set${methodSuffix}`] = setPropertyValue;
		}

		function initializePropertyValue(data) {
			let initValue = defaultValue;

			if (isFunction(defaultValue)) {
				const obtainedValue = Reflect.apply(defaultValue, this, [data]);
				initValue = obtainedValue;
			} else if (data && data.hasOwnProperty(propertyName)) {
				initValue = data[propertyName];
			}

			privates.setProperty(this, propertyName, initValue);
		}

		return this.compose({
			methods, initializers: [initializePropertyValue],
		});
	};
}

export default Model;
