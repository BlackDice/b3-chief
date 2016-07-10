/**
* @module Chief
 */
import stampit from 'stampit';
import { isString, isObject, isFunction } from 'lodash';
import invariant from 'invariant';
import { oneLine } from 'common-tags';

import { BehaviorTree, Class as BehaviorClass } from './behavior3js';
import { Action, Composite, Condition, Decorator } from './behavior3js';
import * as Decorators from './behavior3js/decorators';
import * as Composites from './behavior3js/composites';
import * as Actions from './behavior3js/actions';
import { SUCCESS, FAILURE, RUNNING, ERROR } from './behavior3js/constants';

import Uid from './core/Uid';
import Logger from './core/Logger';
import Private from './core/Private';

const Behavior = stampit({
	initializers: [initializeBehaviorNodeMap, initializeBehaviorTree],
	methods: { listBehaviorNodes },
	staticProperties: { status: { SUCCESS, FAILURE, RUNNING, ERROR }},
}).compose(Uid, Logger);

const standardBaseNodes = {
	Action,
	Composite,
	Condition,
	Decorator,
};

const privates = Private.methods({
	getNodes(owner) {
		return this.get(owner, 'nodes');
	},
}).create();

/**
 * @typedef {NodeDescriptor}
 * @type {object}
 * @property {!string} name of node
 * @property {!function} tick handle tick of node
 * @property {string} base name of node
 */

/**
 * @param {NodeDescriptor[]} [options.nodes] additional nodes to register
 */
function initializeBehaviorNodeMap({ nodes } = {}) {
	privates.init(this);

	const nodeMap = privates.set(this, 'nodes', new Map());
	for (const nodeClass of prepareNodes(nodeMap, nodes)) {
		nodeMap.set(nodeClass.prototype.name, nodeClass);
	}
}

function *prepareNodes(nodeMap, nodeDescriptors) {
	yield *Object.values(Composites);
	yield *Object.values(Decorators);
	yield *Object.values(Actions);
	yield *createNodesFromDescriptors(nodeMap, nodeDescriptors);
}

function *createNodesFromDescriptors(nodeMap, nodeDescriptors) {
	if (!nodeDescriptors) {
		return;
	}

	invariant(nodeDescriptors[Symbol.iterator],
		'Specified options.nodes must be an iterable object, eg. array.'
	);

	for (const descriptor of nodeDescriptors) {
		validateNodeDescriptor(descriptor);

		const baseNodeName = descriptor.base;
		const baseNodeClass = findBaseNode(baseNodeName, nodeMap);

		invariant(typeof baseNodeClass === 'function', oneLine`
			A node descriptor %s has invalid base node %s specified.
			The node is not registered yet nor is built in one.
		`, descriptor.name, baseNodeName);

		yield BehaviorClass(baseNodeClass, descriptor);
	}
}

function validateNodeDescriptor(descriptor) {
	invariant(isObject(descriptor),
		'A node descriptor must be an object.'
	);

	const nodeName = descriptor.name;

	invariant(isString(nodeName) && nodeName.length,
		'A node descriptor must have a name property of non-empty string.'
	);

	invariant(isFunction(descriptor.tick),
		'A node descriptor %s must have a tick method specified.', nodeName
	);
}

function findBaseNode(nodeName, nodeMap) {
	if (isString(nodeName) && nodeName.length) {
		return nodeMap.get(nodeName) || standardBaseNodes[nodeName];
	}
	return null;
}

function initializeBehaviorTree() {

	const createBehaviorNode = (nodeName, nodeId = this.createUid(nodeName), params = null) => {
		invariant(isString(nodeName) && nodeName.length, oneLine`
			Called createBehaviorNode() without name of node to create.
			Name is expected to be a non-empty string.
		`);

		const nodeClass = privates.getNodes(this).get(nodeName);
		if (nodeClass === undefined) {
			return null;
		}

		const clonedParams = isObject(params) ? { ...params } : {};
		const behaviorNode = Reflect.construct(nodeClass, [clonedParams]);
		behaviorNode.id = nodeId;

		return behaviorNode;
	};

	const BehaviorTreeWithNodes = BehaviorClass(BehaviorTree, {
		createBehaviorNode,
	});

	/**
	 * Create instance of B3.BehaviorTree
	 * @param {string} [id] optional id to be set on instance
	 * @return {BehaviorTree}
	 */
	this.createBehaviorTree = (id) => {
		const behaviorTree = new BehaviorTreeWithNodes();
		if (isString(id) && id.length) {
			behaviorTree.id = id;
		}
		behaviorTree.debug = (...args) => this.debug('tree', ...args);
		return behaviorTree;
	};
}

/**
 * @typedef {RegisteredNode}
 * @type {object}
 * @property {!function} constructor of the node
 * @property {!string} name of node
 * @property {!string} category of the node
 * @property {?object} parameters of the node
 */

/**
 * Retrieve list of currently registered behavior nodes
 * @return {RegisteredNode[]}
 */
function listBehaviorNodes() {
	return Array.from(privates.getNodes(this).values()).map((behaviorNode) => ({
		constructor: behaviorNode,
		name: behaviorNode.prototype.name,
		category: behaviorNode.prototype.category,
		parameters: behaviorNode.prototype.parameters,
	}));
}

export default Behavior;
