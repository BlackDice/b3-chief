import { test } from 'ava'

import './_chief'

test.beforeEach((t) => {
	t.context.tree = t.context.instance.createTree('Test tree')
	t.context.parentNode = t.context.tree.createNode('Native-Sequence')
	t.context.childNode = t.context.tree.createNode('Native-Succeeder')
	t.context.tree.setRootNode(t.context.parentNode)
})

test('setRootNode() is expecting node to be used as a root', (t) => {
	const { tree } = t.context
	t.throws(() => tree.setRootNode(), /expecting a node/)
})

test('setRootNode() does not accept node that already has a parent', (t) => {
	const { instance, parentNode } = t.context
	const tree = instance.createTree('Rootless tree')
	t.throws(() => tree.setRootNode(parentNode), /has a parent/)
})

test('setRootNode() sets parentId to ID of the tree', (t) => {
	const { tree, parentNode } = t.context
	t.is(parentNode.getParentId(), tree.getId())
})

test('setRootNode() removes current root node if there is a one', (t) => {
	const { tree, parentNode, childNode } = t.context
	tree.setRootNode(childNode)
	t.not(tree.getRootNode().getId(), parentNode.getId())
})

test('getRootNode() returns null for root less tree', (t) => {
	const { instance } = t.context
	const tree = instance.createTree('Rootless tree')
	const actual = tree.getRootNode()
	t.is(actual, null)
})

test('getRootNode() returns previously set root node', (t) => {
	const { tree, parentNode } = t.context
	const actual = tree.getRootNode()
	t.is(actual.getId(), parentNode.getId())
})

test('addNodeChild() is expecting parent node and child node', (t) => {
	const { tree, parentNode } = t.context
	t.throws(() => tree.addNodeChild(), /expecting parent node/)
	t.throws(() => tree.addNodeChild(parentNode), /expecting child node/)
})

test('addNodeChild() sets parent of passed child node', (t) => {
	const { tree, childNode, parentNode } = t.context
	tree.addNodeChild(parentNode, childNode)
	t.is(childNode.getParentId(), parentNode.getId())
})

test('addNodeChild() cannot accept child based on behavior rules', (t) => {
	const { tree, childNode, parentNode } = t.context
	parentNode.setBehaviorId('Native-Inverter')
	tree.addNodeChild(parentNode, childNode)
	const nextChild = tree.createNode('Native-Failer')
	t.throws(() => tree.addNodeChild(parentNode, nextChild), /cannot accept child/)
})

test('addNodeChild() cannot accept child node that already has parent', (t) => {
	const { tree, childNode, parentNode } = t.context
	tree.addNodeChild(parentNode, childNode)
	const anotherParent = tree.createNode('SecondParent')
	t.throws(() => tree.addNodeChild(anotherParent, childNode, /is child of the node/))
})

test('addNodeChild() sets increased childIndex based on previous present children', (t) => {
	const { tree, childNode, parentNode } = t.context
	tree.addNodeChild(parentNode, childNode)
	t.is(childNode.getChildIndex(), 0)
	const anotherChild = tree.createNode('AnotherChild')
	tree.addNodeChild(parentNode, anotherChild)
	t.is(anotherChild.getChildIndex(), 1)
})

test('removeChildNode() is expecting child node', (t) => {
	const { tree } = t.context
	t.throws(() => tree.removeChildNode(), /expecting a child node/)
})

test('removeChildNode() is expecting child node', (t) => {
	const { tree, childNode } = t.context
	tree.removeChildNode(childNode)
	t.is(childNode.getParentId(), null)
})

test('removeChildNode() updates childIndex of remaining children', (t) => {
	const { tree, parentNode } = t.context
	const firstChild = tree.createNode('First')
	const secondChild = tree.createNode('Second')
	const thirdChild = tree.createNode('Third')
	tree.addNodeChild(parentNode, firstChild)
	tree.addNodeChild(parentNode, secondChild)
	tree.addNodeChild(parentNode, thirdChild)

	tree.removeChildNode(firstChild)
	t.is(secondChild.getChildIndex(), 0)
	t.is(thirdChild.getChildIndex(), 1)

	tree.removeChildNode(secondChild)
	t.is(thirdChild.getChildIndex(), 0)
})

test('getNodeChildren() is expecting node to get children for', (t) => {
	const { tree } = t.context
	t.throws(() => tree.getNodeChildren(), /expecting parent node/)
})

test('getNodeChildren() returns empty array without any children present', (t) => {
	const { tree, parentNode } = t.context
	const actual = tree.getNodeChildren(parentNode)
	t.true(Array.isArray(actual))
	t.is(actual.length, 0)
})

test('getNodeChildren() returns array of node models of parent children', (t) => {
	const { tree, parentNode, childNode } = t.context
	const secondChild = tree.createNode('Native-Inverter')
	const thirdChild = tree.createNode('Native-Failer')
	const notChild = tree.createNode('Native-Error')
	tree.addNodeChild(parentNode, childNode)
	tree.addNodeChild(parentNode, secondChild)
	tree.addNodeChild(parentNode, thirdChild)
	tree.addNodeChild(secondChild, notChild)

	const actual = tree.getNodeChildren(parentNode)
	t.is(actual.length, 3)
	t.is(actual[0].getId(), childNode.getId())
	t.is(actual[1].getId(), secondChild.getId())
	t.is(actual[2].getId(), thirdChild.getId())
})

test('getNodeChildren() returns children sorted by childIndex', (t) => {
	const { tree, parentNode, childNode } = t.context
	const secondChild = tree.createNode('Native-Runner')
	const thirdChild = tree.createNode('Native-Failer')
	tree.addNodeChild(parentNode, childNode)
	tree.addNodeChild(parentNode, secondChild)
	tree.addNodeChild(parentNode, thirdChild)

	secondChild.changeChildIndex(0)
	thirdChild.changeChildIndex(1)
	childNode.changeChildIndex(2)

	const actual = tree.getNodeChildren(parentNode)
	t.is(actual[0].getId(), secondChild.getId())
	t.is(actual[1].getId(), thirdChild.getId())
	t.is(actual[2].getId(), childNode.getId())
})

test('canNodeAcceptChild() returns false for node with leaf behavior', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Native-Error')
	t.false(tree.canNodeAcceptChild(node))
})

test('canNodeAcceptChild() returns true for child-less node with decorator behavior', (t) => {
	const { tree, childNode } = t.context
	const node = tree.createNode('Native-Inverter')
	tree.setRootNode(node)
	t.true(tree.canNodeAcceptChild(node))
	tree.addNodeChild(node, childNode)
	t.false(tree.canNodeAcceptChild(node))
})

test('canNodeAcceptChild() returns true for node with composite behavior', (t) => {
	const { tree, childNode } = t.context
	const node = tree.createNode('Native-Sequence')
	tree.setRootNode(node)
	t.true(tree.canNodeAcceptChild(node))
	tree.addNodeChild(node, childNode)
	t.true(tree.canNodeAcceptChild(node))
})
