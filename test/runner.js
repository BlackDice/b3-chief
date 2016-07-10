import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	const instance = t.context.instance = Chief.create({ tickInterval: 1 });
	t.context.treeA = instance.addTree(instance.createTree());
	t.context.treeB = instance.addTree(instance.createTree());
});

test('tick() invokes tree.tick() for every subject', (t) => {
	const { instance, treeA, treeB } = t.context;
	const subject1 = instance.addSubject(treeA);
	const subject2 = instance.addSubject(treeB);
	t.plan(2);
	treeA.tick = (subject) => t.is(subject, subject1);
	treeB.tick = (subject) => t.is(subject, subject2);
	instance.tick();
});
