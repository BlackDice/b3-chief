import Model, { ModelPrivate } from '../core/Model';

const privates = ModelPrivate.create();

const NodeModel = Model('Node', privates)
	.getter('id')
	.getter('treeId')
	.getter('name')
	.getter('title')
	.getter('description')
	.getter('children')
	.getter('parent')
	.getter('behaviorNode')
	.methods({
		addChild, removeChild, getChildren,
		ensureChildren,	getProperties,
	})
	.init(initializeNodeModel)
;

function initializeNodeModel({ behaviorNode }) {
	privates.setProperty(this, 'behaviorNode', behaviorNode);
}

function getProperties() {
	return { ...this.getBehaviorNode().properties };
}

function getChildren() {
	const children = privates.getProperty(this, 'children');
	if (children === null) {
		return [];
	}
	return Array.from(children);
}

function addChild(childNode) {
	const children = this.ensureChildren();
	children.add(childNode);
	privates.setProperty(childNode, 'parent', this);
}

function removeChild(childNode) {
	const children = privates.getProperty(this, 'children');
	if (children !== null) {
		children.delete(childNode);
		privates.setProperty(childNode, 'parent', null);
	}
}

function ensureChildren() {
	let children = privates.getProperty(this, 'children');
	if (children === null) {
		children = new Set();
		privates.setProperty(this, 'children', children);
	}
	return children;
}

export default NodeModel;
