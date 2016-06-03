import { test } from 'ava';

import Chief from '../src/Chief';

const customNodeDescriptor = {
	name: 'Custom',
	tick() {},
};

test.beforeEach((t) => {
	t.context.instance = Chief.create();
});

test('registerBehaviorNode() expects node descriptor object', (t) => {
	const { instance } = t.context;
	t.throws(() => instance.registerBehaviorNode(), /descriptor object/i);
});

test('registerBehaviorNode() expects node descriptor with a name property', (t) => {
	const { instance } = t.context;
	t.throws(() => instance.registerBehaviorNode({}), /name/i);
});

test('registerBehaviorNode() expects node descriptor with at least a tick method', (t) => {
	const { instance } = t.context;
	const noTickDescriptor = { ...customNodeDescriptor };
	Reflect.deleteProperty(noTickDescriptor, 'tick');
	t.throws(() => instance.registerBehaviorNode(noTickDescriptor), /tick method/i);
});

test('registerBehaviorNode() returns node class based on Action node by default', (t) => {
	const { instance } = t.context;
	const actual = instance.registerBehaviorNode(customNodeDescriptor);
	t.is(typeof actual, 'function');
	t.is(actual.prototype.name, 'Custom');
	t.is(actual.prototype.category, 'action');
});

test('registerBehaviorNode() allows to use Composite as a base node', (t) => {
	const { instance } = t.context;
	const actual = instance.registerBehaviorNode(customNodeDescriptor, 'Composite');
	t.is(actual.prototype.category, 'composite');
});

test('registerBehaviorNode() allows to use Condition as a base node', (t) => {
	const { instance } = t.context;
	const actual = instance.registerBehaviorNode(customNodeDescriptor, 'Condition');
	t.is(actual.prototype.category, 'condition');
});

test('registerBehaviorNode() allows to use Decorator as a base node', (t) => {
	const { instance } = t.context;
	const actual = instance.registerBehaviorNode(customNodeDescriptor, 'Decorator');
	t.is(actual.prototype.category, 'decorator');
});

test('registerBehaviorNode() returns node class based on custom node', (t) => {
	const { instance } = t.context;
	instance.registerBehaviorNode({ ...customNodeDescriptor, name: 'CustomBase' });
	const actual = instance.registerBehaviorNode(customNodeDescriptor, 'CustomBase');
	t.is(typeof actual, 'function');
	t.is(actual.prototype.name, 'Custom');
});

test('listBehaviorNodes() returns collection with built-in nodes', (t) => {
	const { instance } = t.context;
	const actual = instance.listBehaviorNodes();
	const names = actual.map((node) => node.name);
	t.true(names.indexOf('Sequence') >= 0);
	t.true(names.indexOf('Runner') >= 0);
	t.true(names.indexOf('Limiter') >= 0);
});

test('listBehaviorNodes() returns collection with registered nodes', (t) => {
	const { instance } = t.context;
	instance.registerBehaviorNode(customNodeDescriptor);
	const actual = instance.listBehaviorNodes();
	const names = actual.map((node) => node.name);
	t.true(names.indexOf('Custom') >= 0);
});

test('createBehaviorNode() expects string name of node to create', (t) => {
	const { instance } = t.context;
	t.throws(() => instance.createBehaviorNode(), /name is expected/i);
});

test('createBehaviorNode() returns null for unknown node', (t) => {
	const { instance } = t.context;
	t.is(instance.createBehaviorNode('Unknown'), null);
});

test('createBehaviorNode() returns behavior node for built-in nodes', (t) => {
	const { instance } = t.context;
	const actual = instance.createBehaviorNode('Failer');
	t.is(actual.name, 'Failer');
});

test('createBehaviorNode() returns behavior node for registered node', (t) => {
	const { instance } = t.context;
	instance.registerBehaviorNode(customNodeDescriptor);
	const actual = instance.createBehaviorNode('Custom');
	t.is(actual.name, 'Custom');
});

test('createBehaviorTree() returns instance of behavior tree', (t) => {
	const { instance } = t.context;
	const actual = instance.createBehaviorTree();
	t.truthy(actual);
	t.is(typeof actual, 'object');
	t.is(typeof actual.tick, 'function');
});

test('createBehaviorTree() returns instance of behavior tree with specified ID', (t) => {
	const { instance } = t.context;
	const actual = instance.createBehaviorTree('test');
	t.is(actual.id, 'test');
});
