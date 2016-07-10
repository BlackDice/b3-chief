import test from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
});

test('createTree() creates a new tree with unique ID', (t) => {
	const { instance } = t.context;

	const firstTree = instance.createTree();
	t.truthy(firstTree.getId());

	const secondTree = instance.createTree();
	t.not(firstTree.getId(), secondTree.getId());
});

test('createTree() creates a new tree with specified ID', (t) => {
	const { instance } = t.context;

	const tree = instance.createTree('testId');
	t.is(tree.getId(), 'testId');
});

test('addTree() is expecting a tree model to be passed in first argument', (t) => {
	const { instance } = t.context;
	t.throws(() => instance.addTree(), /expecting a tree model/);
});

test('addTree() adds created tree to the list', (t) => {
	const { instance } = t.context;
	const expectedTree = instance.createTree('Sequence');
	instance.addTree(expectedTree);
	t.is(instance.treeCount, 1);
});

test('addTree() emits `tree.add` event with added tree model', (t) => {
	const { instance } = t.context;
	let actual = null;
	instance.once('tree.add', (tree) => {
		actual = tree;
	});
	const tree = instance.createTree();
	instance.addTree(tree);
	t.is(actual, tree);
});

test('getTree() returns tree by ID', (t) => {
	const { instance } = t.context;
	const expectedTree = instance.createTree();
	instance.addTree(expectedTree);
	t.is(instance.getTree(expectedTree.getId()), expectedTree);
	t.is(instance.getTree('non-existing'), null, 'should return null for non-existing tree');
});

test('listTrees() returns all added trees', (t) => {
	const { instance } = t.context;
	t.is(instance.listTrees().length, 0);

	const firstTree = instance.createTree();
	instance.addTree(firstTree);
	t.is(Array.from(instance.listTrees()).length, 1, 'one tree present');

	const secondTree = instance.createTree();
	instance.addTree(secondTree);

	const trees = Array.from(instance.listTrees());
	t.is(trees.length, 2, 'two trees present');
	t.is(trees[0], firstTree);
	t.is(trees[1], secondTree);
});

test('removeTree() removes tree by ID and returns it', (t) => {
	const { instance } = t.context;
	const firstTree = instance.createTree();
	instance.addTree(firstTree);
	const secondTree = instance.createTree();
	instance.addTree(secondTree);
	const removedTree = instance.removeTree(firstTree.getId());
	t.is(removedTree, firstTree);

	const trees = Array.from(instance.listTrees());
	t.is(trees.length, 1, 'one tree remaining');
	t.is(trees[0], secondTree, 'second tree still there');
});

test('removeTree() returns null for non-existing tree', (t) => {
	const { instance } = t.context;
	const removedTree = instance.removeTree('unknown');
	t.is(removedTree, null);
});

test('removeTree() emits `tree.remove` event with removed tree model', (t) => {
	const { instance } = t.context;
	let actual = null;
	instance.once('tree.remove', (tree) => {
		actual = tree;
	});
	const tree = instance.createTree();
	instance.addTree(tree);
	instance.removeTree(tree.getId());
	t.is(actual, tree);
});

test('removeTree() disposes tree model', (t) => {
	const { instance } = t.context;
	const tree = instance.createTree();
	instance.addTree(tree);
	instance.removeTree(tree.getId());
	t.true(tree.isDisposed);
});

