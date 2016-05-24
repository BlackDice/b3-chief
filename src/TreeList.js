import stampit from 'stampit';
import warning from 'warning';

import Behavior from './Behavior';
import Persist, { TYPE as PersistType } from './Persist';

import Uid from './core/Uid';
import EventEmittable from './core/EventEmittable';
import Private from './core/Private';

import TreeModel from './model/Tree';

const TreeList = stampit({
	initializers: [initializeTreeMap],
	methods: {
		createTree, removeTree,
		getTree, listTrees,
	},
}).compose(Behavior, Uid, EventEmittable, Persist);

const privates = Private.create();

function initializeTreeMap() {
	privates.init(this);
	privates.set(this, 'trees', new Map());
	privates.set(this, 'createNode', (...args) => this.createBehaviorNode(...args));
}

function createTree(rootNodeName, rootNodeProperties) {

	const treeId = `tree-${rootNodeName}-${this.createUid()}`;
	const behaviorTree = this.createBehaviorTree(treeId);

	const tree = TreeModel({
		id: treeId, behaviorTree,
		rootNodeName, rootNodeProperties,
		createNode: privates.get(this, 'createNode'),
	});

	privates.get(this, 'trees').set(tree.getId(), tree);
	this.persist(PersistType.TREE, tree);
	this.emit('tree.create', tree);
	return tree;
}

function getTree(treeId) {
	return privates.get(this, 'trees').get(treeId) || null;
}

function removeTree(treeId) {
	const tree = privates.get(this, 'trees').get(treeId);
	warning(tree,
		'Trying to remove tree with ID `%s` that no longer exists.', treeId
	);

	this.destroy(PersistType.TREE, treeId);
	privates.get(this, 'trees').delete(treeId);

	if (tree) {
		this.emit('tree.remove', tree);
		return tree;
	}

	return null;
}

function listTrees() {
	return Array.from(privates.get(this, 'trees').values());
}

export default TreeList;
