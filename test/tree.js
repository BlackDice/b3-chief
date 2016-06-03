import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.tree = t.context.instance.createTree('Sequence');
});

test('addNode() creates node mode and appends it to list of nodes', (t) => {
	const { tree } = t.context;
	const node = tree.addNode('Succeeder');
	t.true(tree.listNodes().includes(node));
});

test('removeNode() removes node from list of nodes', (t) => {
	const { tree } = t.context;
	const node = tree.addNode('Runner');
	tree.removeNode(node);
	t.false(tree.listNodes().includes(node));
});

test('removeNode() removes node from children list of parent node', (t) => {
	const { tree } = t.context;
	const node = tree.addNode('Runner');
	const rootNode = tree.getRootNode();
	rootNode.addChild(node);
	tree.removeNode(node);
	t.false(rootNode.getChildren().includes(node));
});

test('getNode() returns node model by specified ID', (t) => {
	const { tree } = t.context;
	const expected = tree.addNode('Succeeder');
	const actual = tree.getNode(expected.getId());
	t.is(actual, expected);
});

test('getNode() returns null for non-existing node', (t) => {
	const { tree } = t.context;
	const actual = tree.getNode('unknown');
	t.is(actual, null);
});

test('toString() contains ID of the tree', (t) => {
	const { tree } = t.context;
	t.true(tree.toString().indexOf(tree.getId()) > 0);
});
