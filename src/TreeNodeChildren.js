/**
 * @module Chief
 */

import { compose } from 'stampit'
import invariant from 'invariant'
import warning from 'warning'
import { oneLine } from 'common-tags'

import TreeNodeList from './TreeNodeList'

const TreeNodeChildren = compose(TreeNodeList).methods({
	getRootNode,
	setRootNode,
	addNodeChild,
	getNodeChildren,
	removeChildNode,
	canNodeAcceptChild,
})

function addNodeChild(parentNodeId, childNodeId) {
	const parentNode = this.getNode(parentNodeId)
	invariant(parentNode, oneLine`
		Method addNodeChild is expecting parent node as first argument.
	`)

	invariant(parentNode.getParentId() !== null, oneLine`
		%s has no parent assigned yet which leaves it just floating around without any use.
		Use either setRootNode if this is start of the tree or add it as a child
		of the root node or any descendants.
	`, parentNode)

	const childNode = this.getNode(childNodeId)
	invariant(childNode, oneLine`
		Method addNodeChild is expecting child node as second argument.
	`)

	invariant(this.canNodeAcceptChild(parentNode), oneLine`
		%s cannot accept child node %s based on used behavior
	`, parentNode, childNode)

	invariant(childNode.getParentId() === null, oneLine`
		%s is child of the node %s already. Multiple parents are not allowed.
	`, childNode.getId(), childNode.getParentId())

	const children = this.getNodeChildren(parentNodeId)
	childNode.changeChildIndex(children.length)
	childNode.changeParent(parentNode.getId())
}

function removeChildNode(childNodeId) {
	const childNode = this.getNode(childNodeId)
	invariant(childNode, oneLine`
		Method removeChildNode is expecting a child node to be removed from its parent.
	`)

	const parentId = childNode.getParentId()

	if (parentId === null) {
		warning(true, oneLine`
			%s has no parent assigned, method removeChildNode has no effect.
		`, childNode)
		return
	}

	childNode.changeParent(null)
	childNode.changeChildIndex(null)

	const children = this.getNodeChildren(parentId)
	let index = 0

	for (let i = 0, len = children.length; i < len; i += 1) {
		children[i].changeChildIndex(index)
		index += 1
	}
}

function getNodeChildren(parentNodeId) {
	const parentNode = this.getNode(parentNodeId)
	invariant(parentNode, oneLine`
		Method getNodeChildren is expecting parent node as first argument.
	`)

	const children = this.nodeList.filter(parentNode.getId(), 'parentId')
	children.sort((childA, childB) => childA.getChildIndex() - childB.getChildIndex())
	return children
}

function canNodeAcceptChild(parentNodeId) {
	const parentNode = this.getNode(parentNodeId)
	invariant(parentNode, oneLine`
		Method canNodeAcceptChild is expecting parent node as first argument.
	`)

	const maxChildren = this.getBehaviorMaxChildren(parentNode.getBehaviorId())
	if (maxChildren <= 0) {
		return false
	}

	const children = this.nodeList.filter(parentNode.getId(), 'parentId')
	return children.length < maxChildren
}

/**
 * Retrieve node that is used as root for this tree.
 * @return {NodeModel}
 */
function getRootNode() {
	return this.nodeList.find((node) => node.getParentId() === this.identity)
}

/**
 * Change node that is being used as a root for this tree.
 * Previously used root node will be kept on the list, but
 * not used anywhere.
 * @param {Identity} nodeId
 */
function setRootNode(nodeId) {
	const node = this.getNode(nodeId)
	invariant(nodeId, oneLine`
		Method setRootNode is expecting a node to be set as root.
	`)

	invariant(node.getParentId() === null, oneLine`
		%s already has a parent %s set and cannot be used as root node.
	`, node, node.getParentId())

	const currentRootNode = this.getRootNode()
	if (currentRootNode !== null) {
		currentRootNode.changeParent(null)
	}

	node.changeParent(this.identity)
}

export default TreeNodeChildren
