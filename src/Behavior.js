import stampit from 'stampit';
import _isString from 'lodash/isString';
import _isObject from 'lodash/isObject';
import _isFunction from 'lodash/isFunction';
import invariant from 'invariant';

import * as B3 from './behavior3js/index.js';
import * as Decorators from './behavior3js/decorators';
import * as Composites from './behavior3js/composites';
import * as Actions from './behavior3js/actions';

import Uid from './core/Uid';
import Private from './core/Private';

const Behavior = stampit({
	initializers: [initializeBehaviorNodeMap],
	methods: {
		addBehaviorNode,
		createBehaviorTree, createBehaviorNode,
		registerBehaviorNode, listBehaviorNodes,
	},
}).compose(Uid);

const standardBaseNodes = {
	'Action': B3.Action,
	'Composite': B3.Composite,
	'Condition': B3.Condition,
	'Decorator': B3.Decorator,
};

const privates = Private.create();

/**
 * @private
 */
function initializeBehaviorNodeMap() {
	privates.init(this);
	privates.set(this, 'nodes', new Map());

	const standardNodes = Object.values(
		Object.assign({}, Decorators, Composites, Actions)
	);
	standardNodes.forEach(this.addBehaviorNode, this);

	B3.BehaviorTree.prototype.createBehaviorNode = (...args) => this.createBehaviorNode(...args);
}

/**
 * @typedef {NodeDescriptor}
 * @type {object}
 * @property {!string} name of node
 * @property {!function} tick handle tick of node
 */

/**
 * Creates and registers node from given descriptor
 * @param {NodeDescriptor} nodeDescriptor
 * @param {string} [baseNodeName]
 * @return {function} registered behavior node class.
 */
function registerBehaviorNode(nodeDescriptor, baseNodeName = 'Action') {

	invariant(_isObject(nodeDescriptor),
		'registerBehaviorNode() expects node descriptor object.'
	);

	const nodeName = nodeDescriptor.name;

	invariant(_isString(nodeName) && nodeName.length,
		'registerBehaviorNode() expects descriptor with a unique string name specified.'
	);

	invariant(_isFunction(nodeDescriptor.tick),
		'registerBehaviorNode() expects descriptor with a tick method specified.'
	);

	const nodes = privates.get(this, 'nodes');
	const baseNodeClass = nodes.get(baseNodeName) || standardBaseNodes[baseNodeName];

	invariant(typeof baseNodeClass === 'function',
		'registerBehaviorNode() expects valid name of base node class. ' +
		'Specified node `%s` is not registered yet nor is built in one.', baseNodeName
	);

	return this.addBehaviorNode(
		B3.Class(baseNodeClass, nodeDescriptor)
	);
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
 * @return {RegisteredNode[]} [description]
 */
function listBehaviorNodes() {
	return Array.from(privates.get(this, 'nodes').values()).map((behaviorNode) => ({
		constructor: behaviorNode,
		name: behaviorNode.prototype.name,
		category: behaviorNode.prototype.category,
		parameters: behaviorNode.prototype.parameters,
	}));
}

/**
 * Create instance of B3.BehaviorTree
 * @param {string} [id] optional id to be set on instance
 * @return {BehaviorTree}
 */
function createBehaviorTree(id) {
	const behaviorTree = new B3.BehaviorTree();
	if (_isString(id) && id.length) {
		behaviorTree.id = id;
	}
	return behaviorTree;
}

/**
 * @private
 */
function addBehaviorNode(nodeClass) {
	invariant(_isFunction(nodeClass),
		'The registerNode() method has to be called with constructor function of node class.'
	);

	const nodeName = nodeClass.prototype.name;
	const nodes = privates.get(this, 'nodes');

	invariant(!nodes.has(nodeName),
		'The name of node has to be unique. There is already node `%s` registered.', nodeName
	);

	nodes.set(nodeName, nodeClass);

	return nodeClass;
}

/**
 * @private
 */
function createBehaviorNode(nodeName, properties = null) {
	invariant(_isString(nodeName),
		'Called createBehaviorNode() without name of node to create.' +
		'Name is expected to be a non-empty string.'
	);

	const nodeClass = privates.get(this, 'nodes').get(nodeName);
	if (nodeClass === undefined) {
		return null;
	}

	const behaviorNode = Reflect.construct(nodeClass, []);
	behaviorNode.id = this.createUid(nodeName);

	if (_isObject(properties) && _isObject(behaviorNode.properties)) {
		Object.assign(behaviorNode.properties, properties);
	}

	return behaviorNode;
}

export default Behavior;
