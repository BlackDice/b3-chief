import stampit from 'stampit';
import warning from 'warning';
import invariant from 'invariant';
import { oneLine } from 'common-tags';

import Behavior from './Behavior';
import TreeModel from './model/Tree';

import Uid from './core/Uid';
import EventEmittable from './core/EventEmittable';
import Private from './core/Private';

const TreeList = stampit({
	initializers: [initializeTreeMap],
	methods: {
		createTree, addTree, removeTree,
		getTree, listTrees,
	},
}).compose(Behavior, Uid, EventEmittable);

const privates = Private.create();

function initializeTreeMap() {
	const treeMap = new Map();

	privates.init(this);
	privates.set(this, 'trees', treeMap);

	Reflect.defineProperty(this, 'treeCount', {
		get() { return treeMap.size; },
	});
}

function createTree(treeId = this.createUid('tree')) {
	const behaviorTree = this.createBehaviorTree(treeId);

	return TreeModel({
		id: treeId, behaviorTree,
	});
}

function addTree(tree) {
	invariant(tree, oneLine`
		Method addTree is expecting a tree model. Got '%s'
	`, tree);

	invariant(tree.isDisposed !== true, oneLine`
		Cannot add tree '%s' that is already disposed.
	`, tree);

	privates.get(this, 'trees').set(tree.getId(), tree);
	this.emit('tree.add', tree);

	return tree;
}

function getTree(treeId) {
	return privates.get(this, 'trees').get(treeId) || null;
}

function removeTree(treeId) {
	const tree = this.getTree(treeId);
	warning(tree,
		'Trying to remove tree with ID `%s` that no longer exists.', treeId
	);

	if (tree) {
		privates.get(this, 'trees').delete(treeId);
		tree.dispose();
		this.emit('tree.remove', tree);
		return tree;
	}

	return null;
}

function listTrees() {
	return Array.from(privates.get(this, 'trees').values());
}

export default TreeList;
