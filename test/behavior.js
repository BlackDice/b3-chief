import { test } from 'ava';

import Behavior from '../src/Behavior';

function CustomNode() {}
CustomNode.prototype.name = 'Custom';
CustomNode.prototype.tick = () => {};

test.beforeEach((t) => {
	t.context.instance = Behavior.create();
});

test('registerBehaviorNode() expects constructor function of node', (t) => {
	const { instance } = t.context;
	t.throws(() => instance.registerBehaviorNode(), /constructor/i);
});

test('registerBehaviorNode() expects node class with at least tick method', (t) => {
	const { instance } = t.context;
	t.throws(() => instance.registerBehaviorNode(() => {}), /tick/i);
});

test('registerBehaviorNode() expects node class with a name property on its prototype', (t) => {
	const { instance } = t.context;
	function NamelessNode() {}
	NamelessNode.prototype.tick = () => {};
	t.throws(() => instance.registerBehaviorNode(NamelessNode), /name/i);
});

test('registerBehaviorNode() expects node class with a name property on its prototype', (t) => {
	const { instance } = t.context;
	instance.registerBehaviorNode(CustomNode);
	t.throws(() => instance.registerBehaviorNode(CustomNode), /unique/i);
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
	instance.registerBehaviorNode(CustomNode);
	const actual = instance.createBehaviorNode('Custom');
	t.is(actual.name, 'Custom');
});
