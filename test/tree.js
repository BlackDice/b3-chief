import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.tree = t.context.instance.createTree();
	t.context.rootNode = t.context.tree.setRootNode(
		t.context.tree.createNode('Sequence')
	);
	t.context.subject = t.context.instance.addSubject(t.context.tree);
});

test('is updatable', (t) => {
	const { tree } = t.context;
	t.is(typeof tree.onUpdate, 'function');
});

test('createNode() creates node model with specified name', (t) => {
	const { tree } = t.context;
	const node = tree.createNode('Succeeder');
	t.is(node.getName(), 'Succeeder');
});

test('addNode() appends node model to list of nodes', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	t.true(tree.listNodes().includes(node));
});

test('addNode() triggers updatable handlers', (t) => {
	const { tree } = t.context;
	t.plan(1);
	tree.onUpdate((update) => t.is(update.target, tree));
	tree.addNode(tree.createNode('Succeeder'));
});

test('addNode() triggers updatable handlers when added node is updated', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Sequence'));
	const childNode = tree.addNode(tree.createNode('Failer'));
	t.plan(2);
	tree.onUpdate((update) => t.is(update.target, tree));
	node.addChild(childNode);
	node.removeChild(childNode);
});

test('removeNode() removes node from list of nodes', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Runner'));
	tree.removeNode(node);
	t.false(tree.listNodes().includes(node));
});

test('removeNode() removes node from children list of parent node', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Runner'));
	const rootNode = tree.getRootNode();
	rootNode.addChild(node);
	tree.removeNode(node);
	t.false(rootNode.getChildren().includes(node));
});

test('removeNode() disposes removed node model', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Runner'));
	tree.removeNode(node);
	t.true(node.isDisposed);
});

test('removeNode() triggers updatable handlers', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Runner'));
	tree.removeNode(node);
	t.false(tree.listNodes().includes(node));
});

test('removeNode() is expecting child node to be removed', (t) => {
	const { tree } = t.context;
	tree.addNode(tree.createNode('Runner'));
	t.throws(() => tree.removeNode(), /expecting a node model/);
});

test('removeNode() clears root node of tree if removing same node', (t) => {
	const { tree, rootNode } = t.context;
	tree.removeNode(rootNode);
	t.is(tree.getRootNode(), null);
});

test('getNode() returns node model by specified ID', (t) => {
	const { tree } = t.context;
	const expected = tree.addNode(tree.createNode('Succeeder'));
	const actual = tree.getNode(expected.getId());
	t.is(actual, expected);
});

test('getNode() returns null for non-existing node', (t) => {
	const { tree } = t.context;
	const actual = tree.getNode('unknown');
	t.is(actual, null);
});

test('setRootNode() is expecting node model to be used as a root', (t) => {
	const { tree } = t.context;
	t.throws(() => tree.setRootNode(), /expecting a node model/);
});

test('setRootNode() does not accept node that already has a parent', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Failer'));
	rootNode.addChild(node);
	t.throws(() => tree.setRootNode(node), /it is already a child of/);
});

test('setRootNode() removes current root node if still present', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.createNode('Succeeder');
	tree.setRootNode(node);
	t.not(tree.getRootNode(), rootNode);
});

test('setRootNode() removes current root node unless is disposed already', (t) => {
	const { tree, rootNode } = t.context;
	tree.removeNode(rootNode);
	const node = tree.createNode('Succeeder');
	t.notThrows(() => tree.setRootNode(node));
});

test('setRootNode() changes current root node', (t) => {
	const { tree } = t.context;
	const node = tree.createNode('Succeeder');
	tree.setRootNode(node);
	t.is(tree.getRootNode(), node);
});

test('tick() is expecting subject model', (t) => {
	const { tree } = t.context;
	t.throws(() => tree.tick(), /expecting subject/);
	t.throws(() => tree.tick({}), /missing getTarget method/);
	t.throws(() => tree.tick({ getTarget: () => {}}), /missing getBlackboardInterface method/);
});

test('tick() verifies that correct subject is being ticked', (t) => {
	const { tree, instance } = t.context;
	const otherTree = instance.createTree();
	const subject = instance.addSubject(otherTree);
	t.throws(() => tree.tick(subject), /it should run tree/);
});

test('tick() invokes tick method of behaviorTree instance', (t) => {
	const { tree, subject } = t.context;
	const behaviorTree = tree.getBehaviorTree();
	t.plan(1);
	behaviorTree.tick = () => t.pass('tick called');
	tree.tick(subject);
});

test('toString() contains ID of the tree', (t) => {
	const { tree } = t.context;
	t.true(tree.toString().indexOf(tree.getId()) > 0);
});
