import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.tree = t.context.instance.createTree();
});

test('toString() contains id of subject', (t) => {
	const { instance, tree } = t.context;
	const subject = instance.addSubject(tree);
	t.true(subject.toString().indexOf(subject.getId()) >= 0);
});
