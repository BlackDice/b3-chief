import test from 'ava'

import './_chief'

test('createTree() returns tree model with specified name', (t) => {
	const { instance } = t.context
	const actual = instance.createTree('Test tree')
	t.truthy(actual)
	t.is(actual.getName(), 'Test tree')
})

test('createTree() creates a new tree with unique ID', (t) => {
	const { instance } = t.context

	const firstTree = instance.createTree('Test tree')
	t.truthy(firstTree.getId())

	const secondTree = instance.createTree('Second tree')
	t.not(firstTree.getId(), secondTree.getId())
})

test('createTree() adds created tree to the list', (t) => {
	const { instance } = t.context
	const treeCount = instance.treeCount
	instance.createTree('Test tree')
	t.is(instance.treeCount, treeCount + 1)
})

test('hasTree() checks if tree by ID is present in the list', (t) => {
	const { instance } = t.context
	const expectedTree = instance.createTree('Test tree')
	t.true(instance.hasTree(expectedTree.getId()))
	t.false(instance.hasTree('non-existing'))
})

test('getTree() returns tree by ID or null if not exists', (t) => {
	const { instance } = t.context
	const expected = instance.createTree('Test tree')
	const actual = instance.getTree(expected.getId())
	t.is(actual.getId(), expected.getId())
	t.is(instance.getTree('non-existing'), null, 'should return null for non-existing tree')
})

test('listTrees() returns all added trees', (t) => {
	const { instance } = t.context
	const treeCount = instance.treeCount
	t.is(instance.listTrees().length, treeCount)

	const firstTree = instance.createTree('Test tree')
	t.is(Array.from(instance.listTrees()).length, treeCount + 1, 'one tree present')

	const secondTree = instance.createTree('Second tree')

	const trees = Array.from(instance.listTrees())
	t.is(trees.length, treeCount + 2, 'two trees present')
	t.is(trees[0 + treeCount].getId(), firstTree.getId())
	t.is(trees[1 + treeCount].getId(), secondTree.getId())
})

test('destroyTree() clears tree by ID', (t) => {
	const { instance } = t.context

	const firstTree = instance.createTree('Test tree')
	const secondTree = instance.createTree('Second tree')
	const id = firstTree.getId()

	instance.destroyTree(id)
	t.false(instance.hasTree(id))
	t.true(instance.hasTree(secondTree.getId()))
})

