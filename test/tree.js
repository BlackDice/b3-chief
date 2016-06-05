import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.tree = t.context.instance.createTree('Sequence');
	t.context.subject = t.context.instance.addSubject(t.context.tree);
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
	t.throws(() => tree.tick(subject), /it should run tree/)
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