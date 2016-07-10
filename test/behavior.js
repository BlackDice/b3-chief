import { test } from 'ava';

import Chief from '../src/Chief';

const customNodeDescriptor = {
	name: 'Custom',
	base: 'Action',
	tick() {},
};

test('options.nodes is optional parameter', (t) => {
	t.notThrows(Chief);
});

test('options.nodes is expected to be iterable object', (t) => {
	t.throws(() => Chief({ nodes: 10 }), /iterable object/);
});

test('options.nodes contains node descriptor objects', (t) => {
	const nodes = [10];
	t.throws(() => Chief({ nodes }), /must be an object/);
});

test('node descriptor is object with non-empty string property `name`', (t) => {
	const nodes = [{}, { name: '' }];
	t.throws(() => Chief({ nodes }), /name property/);
});

test('node descriptor object must have `tick` method', (t) => {
	const nodes = [{ name: 'test' }];
	t.throws(() => Chief({ nodes }), /tick method/);
});

test('node descriptor property `base` cannot be empty', (t) => {
	const nodes = [{ ...customNodeDescriptor, base: '' }];
	t.throws(() => Chief({ nodes }), /invalid base node/);
});

test('node descriptor property `base` must refer to existing node', (t) => {
	const nodes = [{ ...customNodeDescriptor, base: 'Unknown' }];
	t.throws(() => Chief({ nodes }), /invalid base node/);
});

test('listBehaviorNodes() returns array describing nodes', (t) => {
	const chief = Chief();
	const actual = chief.listBehaviorNodes();
	t.true(Array.isArray(actual));
	const [first, second] = actual;
	t.is(first.name, first.constructor.prototype.name);
	t.is(second.category, second.constructor.prototype.category);
	const limiter = actual.find((node) => node.name === 'Limiter');
	t.deepEqual(limiter.parameters, limiter.constructor.prototype.parameters);
});

test('node descriptor can use `base` of one of standard nodes', (t) => {
	const nodes = [
		{ name: 'A', base: 'Action', tick: () => {}},
		{ name: 'C', base: 'Composite', tick: () => {}},
		{ name: 'D', base: 'Decorator', tick: () => {}},
		{ name: 'N', base: 'Condition', tick: () => {}},
		{ name: 'S', base: 'Sequence', tick: () => {}},
	];
	const chief = Chief({ nodes });
	const list = chief.listBehaviorNodes();
	t.is(list.find((node) => node.name === 'A').category, 'action');
	t.is(list.find((node) => node.name === 'C').category, 'composite');
	t.is(list.find((node) => node.name === 'D').category, 'decorator');
	t.is(list.find((node) => node.name === 'N').category, 'condition');
	t.is(list.find((node) => node.name === 'S').category, 'composite');
});

test('node descriptor can use `base` of other nodes registered', (t) => {
	const nodes = [
		{ ...customNodeDescriptor, customMethod: () => {}},
		{ name: 'Test', base: 'Custom', tick: () => {}},
	];
	const chief = Chief({ nodes });
	const list = chief.listBehaviorNodes();
	const testNode = list.find((node) => node.name === 'Test');
	t.is(testNode.constructor.prototype.customMethod, nodes[0].customMethod);
});

test('createBehaviorTree() returns instance of behavior tree', (t) => {
	const tree = Chief().createBehaviorTree();
	t.truthy(tree);
	t.is(typeof tree, 'object');
	t.is(typeof tree.tick, 'function');
});

test('createBehaviorTree() returns instance of behavior tree with specified ID', (t) => {
	const tree = Chief().createBehaviorTree('test');
	t.is(tree.id, 'test');
});

test('behavior tree has createBehaviorNode() method', (t) => {
	const tree = Chief().createBehaviorTree();
	t.is(typeof tree.createBehaviorNode, 'function');
});

test('createBehaviorNode() expects name of behavior node', (t) => {
	const tree = Chief().createBehaviorTree();
	t.throws(() => tree.createBehaviorNode(), /name of node/);
	t.throws(() => tree.createBehaviorNode(''), /name of node/);
});

test('createBehaviorNode() returns instance of behavior node based on name', (t) => {
	const tree = Chief().createBehaviorTree();
	const actual = tree.createBehaviorNode('Sequence');
	t.truthy(actual);
	t.is(actual.name, 'Sequence');
});

test('createBehaviorNode() generates id of node', (t) => {
	const tree = Chief().createBehaviorTree();
	const actual = tree.createBehaviorNode('Sequence');
	t.truthy(actual.id);
});

test('createBehaviorNode() uses id from second argument', (t) => {
	const tree = Chief().createBehaviorTree();
	const actual = tree.createBehaviorNode('Sequence', 'nodeId');
	t.is(actual.id, 'nodeId');
});

test('createBehaviorNode() returns null for non-existing node', (t) => {
	const tree = Chief().createBehaviorTree();
	const actual = tree.createBehaviorNode('Unknown');
	t.is(actual, null);
});

test('createBehaviorNode() passes specified node parameters to node instance', (t) => {
	t.plan(1);
	const expected = { foo: 'bar' };
	const nodes = [{ ...customNodeDescriptor, initialize: (params) => {
		t.deepEqual(params, expected);
	}}];
	const tree = Chief({ nodes }).createBehaviorTree();
	tree.createBehaviorNode('Custom', undefined, expected);
});
