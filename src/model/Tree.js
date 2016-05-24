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
		addNode, changeRootNode,
		listNodes, toString,
	})
	.init(initializeTreeModel, initializeRootNode)
;

function initializeTreeModel({ createNode }) {
	privates.set(this, 'createNode', createNode);
	privates.set(this, 'nodes', new Set());
}

function initializeRootNode({ rootNodeName, rootNodeProperties }) {
	if (rootNodeName) {
		this.changeRootNode(rootNodeName, rootNodeProperties);
	}
}

function addNode(nodeName, nodeProperties) {
	const createNode = privates.get(this, 'createNode');
	const behaviorNode = createNode(nodeName, nodeProperties);
	const nodeModel = buildNodeModel(behaviorNode, this.getId());
	privates.get(this, 'nodes').add(nodeModel);
	return nodeModel;
}

function changeRootNode(nodeName, nodeProperties) {
	const nodes = privates.get(this, 'nodes');
	const createNode = privates.get(this, 'createNode');

	const currentRootNode = this.getRootNode();
	nodes.delete(currentRootNode);

	const behaviorRootNode = createNode(nodeName, nodeProperties);
	this.getBehaviorTree().root = behaviorRootNode;

	const newRootNode = buildNodeModel(behaviorRootNode, this.getId());
	nodes.add(newRootNode);
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
	return `${this.getName() || 'Tree'} [${this.getId()}]`;
}

export default TreeModel;
