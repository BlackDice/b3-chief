import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.tree = t.context.instance.createTree('Sequence');
	t.context.rootNode = t.context.tree.getRootNode();
});

test('getChildren() returns empty array without any children present', (t) => {
	const { rootNode } = t.context;
	t.is(rootNode.getChildren().length, 0);
});

test('addChild() appends node to children list', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode('Runner');
	rootNode.addChild(node);
	t.deepEqual(rootNode.getChildren(), [node]);
});

test('addChild() sets parent of added child node', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode('Succeeder');
	rootNode.addChild(node);
	t.is(node.getParent(), rootNode);
});

test('removeChild() removes node from children list and returns it', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode('Succeeder');
	rootNode.addChild(node);
	const removed = rootNode.removeChild(node);
	t.is(rootNode.getChildren().length, 0);
	t.is(removed, node);
});

test('removeChild() clears parent node from removed child', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode('Succeeder');
	rootNode.addChild(node);
	rootNode.removeChild(node);
	t.falsy(node.getParent());
});

test('getProperties() returns properties specified on behavior node prototype', (t) => {
	const { tree } = t.context;
	const node = tree.addNode('Repeater');
	t.truthy(node.getProperties());
});
