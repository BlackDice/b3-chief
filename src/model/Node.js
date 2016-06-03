import Model, { ModelPrivate } from '../core/Model';
import invariant from 'invariant';
import warning from 'warning';

const privates = ModelPrivate.methods({
	getChildren(owner, ensure = true) {
		let children = this.getProperty(owner, 'children');
		if (children === null && ensure === true) {
			children = new Set();
			this.setProperty(owner, 'children', children);
		}
		return children;
	},
}).create();

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
		hasChild, addChild, removeChild,
		hasChildren, getChildren,
		getProperties, toString,
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
	const children = privates.getChildren(this, false);
	if (children === null) {
		return [];
	}
	return Array.from(children);
}

function hasChildren() {
	const children = privates.getChildren(this, false);
	return children !== null && children.size > 0;
}

function hasChild(childNode) {
	const children = privates.getChildren(this, false);
	return children !== null && children.has(childNode);
}

function addChild(childNode) {
	const children = privates.getChildren(this);

	invariant(!children.has(childNode),
		'Node %s is child of %s already', childNode, this
	);

	const parentNode = childNode.getParent();
	invariant(parentNode === null || parentNode === this,
		'Trying to add node %s that has parent %s already', childNode, parentNode
	);

	children.add(childNode);
	privates.setProperty(childNode, 'parent', this);
}

function removeChild(childNode) {
	const children = privates.getChildren(this, false);
	if (children === null) {
		return null;
	}

	warning(children.has(childNode),
		'Trying to remove child node %s from %s. Node is child of %s.',
		childNode, this, childNode.getParent()
	);

	children.delete(childNode);
	privates.setProperty(childNode, 'parent', null);
	return childNode;
}

function toString() {
	return this.getId();
}

export default NodeModel;
