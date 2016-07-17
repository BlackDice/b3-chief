import { isFunction } from 'lodash';
import invariant from 'invariant';
import { oneLine } from 'common-tags';

import Model, { ModelPrivate } from '../core/Model';
import Updateable from '../core/Updateable';
import NodeModel from './Node';

const privates = ModelPrivate.create();

const TreeModel = Model('Tree', privates)
	.compose(Updateable)
	.getter('id')
	.getter('behaviorTree')
	.property('rootNode')
	.property('name', 'New tree')
	.property('description')
	.methods({
		createNode, addNode, removeNode,
		setRootNode, getNode, listNodes,
		tick, toString,
	})
	.init(initializeTreeModel)
;

function initializeTreeModel() {
	privates.set(this, 'nodes', new Set());
	this.on('change', (change) => this.didUpdate('treeChange', change));
}

function tick(subject) {
	invariant(subject,
		'Method tick() of tree model is expecting subject model.'
	);
	invariant(isFunction(subject.getTarget),
		'Passed subject model is missing getTarget method.'
	);
	invariant(isFunction(subject.getBlackboardInterface),
		'Passed subject model is missing getBlackboardInterface method.'
	);
	invariant(subject.getTreeId() === this.getId(),
		'Trying to tick subject %s with tree %s while it should run tree %s',
		subject.getId(), this.getId(), subject.getTreeId()
	);

	this.getBehaviorTree().tick(
		subject.getTarget(), subject.getBlackboardInterface()
	);
}

function createNode(nodeName, nodeProperties, nodeId) {
	const behaviorTree = this.getBehaviorTree();
	const behaviorNode = behaviorTree.createBehaviorNode(
		nodeName, nodeId, nodeProperties
	);
	return buildNodeModel(behaviorNode, this.getId());
}

function addNode(nodeModel) {
	invariant(nodeModel, oneLine`
		Method addTree() is expecting a node model. Got '%s'
	`, nodeModel);

	invariant(nodeModel.isDisposed !== true, oneLine`
		Cannot add node '%s' that is already disposed.
	`, nodeModel);

	privates.get(this, 'nodes').add(nodeModel);
	this.didUpdate('addNode', nodeModel);
	nodeModel.onUpdate(this.didUpdate);

	return nodeModel;
}

function removeNode(nodeModel) {
	invariant(nodeModel, oneLine`
		Method removeNode() is expecting a node model for removal.
	`);

	removeNodeFromTree(this, nodeModel);
	removeNodeFromParent(nodeModel);

	nodeModel.dispose();
	this.didUpdate('removeNode', nodeModel);
}

function removeNodeFromTree(treeModel, nodeModel) {
	privates.get(treeModel, 'nodes').delete(nodeModel);
	if (treeModel.getRootNode() === nodeModel) {
		privates.setProperty(treeModel, 'rootNode', null);
	}
}

function removeNodeFromParent(nodeModel) {
	const parent = nodeModel.getParent();
	if (parent !== null) {
		parent.removeChild(nodeModel);
	}
}

function getNode(nodeId) {
	const nodes = privates.get(this, 'nodes');
	for (const node of nodes) {
		if (node.getId() === nodeId) {
			return node;
		}
	}
	return null;
}

function setRootNode(rootNodeModel) {
	const currentRootNode = this.getRootNode();
	if (currentRootNode !== null) {
		this.removeNode(currentRootNode);
	}

	invariant(rootNodeModel, oneLine`
		Method setRootNode() is expecting a node model. Got '%s'
	`, rootNodeModel);

	invariant(rootNodeModel.getParent() === null, oneLine`
		Trying to use node %s as a root model, but it is already
		a child of %s node.
	`, rootNodeModel, rootNodeModel.getParent());

	this.addNode(rootNodeModel);
	this.getBehaviorTree().root = rootNodeModel.getBehaviorNode();

	privates.setProperty(this, 'rootNode', rootNodeModel);

	this.didUpdate('setRootNode', rootNodeModel);

	return rootNodeModel;
}

function listNodes() {
	return Array.from(privates.get(this, 'nodes').values());
}

function buildNodeModel(behaviorNode, treeId) {
	return NodeModel.create({
		behaviorNode, treeId,
		id: behaviorNode.id,
		name: behaviorNode.name,
		title: behaviorNode.title,
		description: behaviorNode.description,
	});
}

function toString() {
	return `${this.getName()} [${this.getId()}]`.trim();
}

export default TreeModel;
