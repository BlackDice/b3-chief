import stampit from 'stampit';
import { Enum } from 'enumify';
import isObject from 'lodash.isobject';
import warning from 'warning';

import Logger from './core/Logger';

const Persist = stampit({
	initializers: initializer,
	methods: { persist, retrieve, destroy },
}).compose(Logger);

function initializer({ adapter } = {}, { instance }) {
	instance.adapter = instance.adapter || ensureAdapter(adapter);
}

function persist() {

}

function retrieve() {

}

function destroy() {

}

function ensureAdapter(adapter) {
	if (isObject(adapter)) {
		return adapter;
	}
	// warning(false, 'Valid adapter object was not found in first argument. No data will be persisted.'); // eslint-disable-line max-len
	return {};
}

export class TYPE extends Enum {}
TYPE.initEnum(['TREE', 'SUBJECT']);

export default Persist;
