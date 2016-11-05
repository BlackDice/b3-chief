import { test } from 'ava'

import './_chief'

test.beforeEach((t) => {
	t.context.tree = t.context.instance.createTree('Test tree')
})

test('createNode is expecting behavior to be passed', (t) => {
	const { tree } = t.context
	t.throws(() => tree.createNode(), /expecting a behavior/)
})

test('createNode() creates and appends new node with unique ID', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	const node2 = tree.createNode('Test')
	t.not(node.getId(), node2.getId())
	t.true(tree.hasNode(node.getId()))
	t.true(tree.hasNode(node2.getId()))
})

test('createNode() sets passed identity as behaviorId attribute', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	t.is(node.getBehaviorId(), 'Test')
})

test('createNode() sets second argument as behaviorConfig attribute', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test', { config: 10 })
	t.deepEqual(node.getBehaviorConfig(), { config: 10 })
})

test('hasNode() checks if node model is present on the tree', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	t.true(tree.hasNode(node.getId()))
	t.false(tree.hasNode('bad node'))
})

test('getNode() returns node model by specified ID', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	const actual = tree.getNode(node.getId())
	t.truthy(actual)
})

test('getNode() returns null for non-existing node', (t) => {
	const { tree } = t.context
	const actual = tree.getNode('unknown')
	t.is(actual, null)
})

test('destroyNode() removes node from list of nodes', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	const id = node.getId()
	tree.destroyNode(id)
	t.false(tree.hasNode(id))
})

test('destroyNode() forbids to destroy node that has a parent', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	tree.setRootNode(node)
	t.throws(() => tree.destroyNode(node), /has a parent/)
})

test('toString() contains ID of the node and behavior', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	t.true(node.toString().indexOf(node.getId()) >= 0)
	t.true(node.toString().indexOf('Test') >= 0)
})

test('node title can be set', (t) => {
	const { tree } = t.context
	const node = tree.createNode('Test')
	node.setTitle('Title')
	t.is(node.getTitle(), 'Title')
})
