import test from 'ava'
import { treesFixture } from '../fixture'

import Store from '../../src/Store'

test.beforeEach((t) => {
	t.context.store = Store.create({ preloadedState: treesFixture() }).store
	t.context.selectAll = t.context.store.select((state) => state.trees)
	t.context.selectOne = t.context.store.select((state, id = 'TestTree') => state.trees[id])
})

test('addTree() sets passed tree to state by id', (t) => {
	const { store, selectAll } = t.context
	store.actions.addTree({
		id: 'test',
		name: 'TestTree',
		nodes: {},
	})
	const trees = selectAll()
	t.truthy(trees.test)
	t.is(trees.test.name, 'TestTree')
})

test('removeTree() clears tree by id from state', (t) => {
	const { store, selectAll } = t.context
	store.actions.removeTree('TestTree')
	const trees = selectAll()
	t.falsy(trees.TestTree)
})

test('updateTree() can change properties of tree', (t) => {
	const { store, selectOne } = t.context
	store.actions.updateTree({
		id: 'TestTree',
		property: 'name',
		value: 'NewName',
	})
	const tree = selectOne()
	t.is(tree.name, 'NewName')
})

test('replaceTrees uses passed list of trees instead of existing one', (t) => {
	const { store, selectAll } = t.context
	const trees = {
		NewTree: {
			id: 'NewTree',
			name: 'Replaced tree',
			nodes: {},
		},
	}
	store.actions.replaceTrees(trees)
	const stateTrees = selectAll()
	t.is(Object.keys(stateTrees).length, 1)
	t.truthy(stateTrees.NewTree)
})

test('addTreeNode() sets passed node to tree nodes list', (t) => {
	const { store, selectOne } = t.context
	store.actions.addTreeNode({
		treeId: 'TestTree',
		node: {
			id: 'TestNode',
			behaviorId: 'Native-Succeeder',
			parentId: 'TestRoot',
			childIndex: 2,
		},
	})
	const tree = selectOne()
	t.truthy(tree.nodes.TestNode)
	t.is(tree.nodes.TestNode.parentId, 'TestRoot')
	t.is(tree.nodes.TestNode.childIndex, 2)
})

test('removeTreeNode() clears node from tree nodes list', (t) => {
	const { store, selectOne } = t.context
	store.actions.removeTreeNode({
		treeId: 'TestTree',
		nodeId: 'TestSecondChild',
	})
	const tree = selectOne()
	t.falsy(tree.nodes.TestSecondChild)
})

test('updateTreeNode() can change properties of node', (t) => {
	const { store, selectOne } = t.context
	store.actions.updateTreeNode({
		treeId: 'TestTree',
		nodeId: 'TestSecondChild',
		property: 'childIndex',
		value: 5,
	})
	const tree = selectOne()
	t.is(tree.nodes.TestSecondChild.childIndex, 5)
})
