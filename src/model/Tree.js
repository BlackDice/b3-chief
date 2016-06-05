import { isFunction } from 'lodash';
import invariant from 'invariant';

import Model, { ModelPrivate } from '../core/Model';
import NodeModel from './Node';

const privates = ModelPrivate.create();

const TreeModel = Model('Tree', privates)
	.getter('id')
	.getter('rootNode')
	.getter('behaviorTree')
	.property('name', 'New tree')
	.property('description')
	.methods({
		addNode, removeNode, getNode, listNodes,
		changeRootNode, tick, toString,
	})
	.init(initializeTreeModel, initializeRootNode)
;

function initializeTreeModel() {
	privates.set(this, 'nodes', new Set());
}

function initializeRootNode({ rootNodeName, rootNodeProperties }) {
	if (rootNodeName) {
		this.changeRootNode(rootNodeName, rootNodeProperties);
	}
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

function addNode(nodeName, nodeProperties) {
	const behaviorTree = this.getBehaviorTree();
	const behaviorNode = behaviorTree.createBehaviorNode(nodeName, nodeProperties);
	const nodeModel = buildNodeModel(behaviorNode, this.getId());
	privates.get(this, 'nodes').add(nodeModel);
	return nodeModel;
}

function removeNode(nodeModel) {
	privates.get(this, 'nodes').delete(nodeModel);
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

function changeRootNode(nodeName, nodeProperties) {
	const nodes = privates.get(this, 'nodes');

	const currentRootNode = this.getRootNode();
	nodes.delete(currentRootNode);

	const newRootNode = this.addNode(nodeName, nodeProperties);
	this.getBehaviorTree().root = newRootNode.getBehaviorNode();

	privates.setProperty(this, 'rootNode', newRootNode);
	return newRootNode;
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
