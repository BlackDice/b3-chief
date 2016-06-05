import { test } from 'ava';

import Model from '../src/core/Model';
import Chief from '../src/Chief';

const TreeModelMock = Model('TreeModelMock')
	.getter('id', 'test')
;

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.treeModel = TreeModelMock();
});

test('addSubject() expects tree model in first argument', (t) => {
	t.throws(() => t.context.instance.addSubject(), /tree model expected/);
});

test('addSubject() creates a new subject with unique ID', (t) => {
	const { instance, treeModel } = t.context;

	const firstSubject = instance.addSubject(treeModel);
	t.truthy(firstSubject);
	t.truthy(firstSubject.getId());

	const secondSubject = instance.addSubject(treeModel);
	t.false(firstSubject.getId() === secondSubject.getId());
});

test('addSubject() sets treeId to ID of passed tree model', (t) => {
	const { instance, treeModel } = t.context;
	const subject = instance.addSubject(treeModel);
	t.is(subject.getTreeId(), treeModel.getId());
});

test('addSubject() emits `subject.add` event with added subject model', (t) => {
	const { instance, treeModel } = t.context;
	let actual = null;
	instance.once('subject.add', (subject) => {
		actual = subject;
	});
	const subject = instance.addSubject(treeModel);
	t.is(actual, subject);
});

test('addSubject() sets second argument value as target property of subject model', (t) => {
	const { instance, treeModel } = t.context;
	const target = {};
	const subject = instance.addSubject(treeModel, target);
	t.is(subject.getTarget(), target);
});

test('getSubject() returns subject by ID', (t) => {
	const { instance, treeModel } = t.context;
	const expectedSubject = instance.addSubject(treeModel);
	t.is(instance.getSubject(expectedSubject.getId()), expectedSubject);
	t.is(instance.getSubject('non-existing'), null, 'should return null for non-existing subject');
});

test('listSubjects() returns all existing subjects', (t) => {
	const { instance, treeModel } = t.context;
	t.is(instance.listSubjects().length, 0);

	const firstSubject = instance.addSubject(treeModel);
	t.is(Array.from(instance.listSubjects()).length, 1, 'one subject');

	const secondSubject = instance.addSubject(treeModel);

	const subjects = Array.from(instance.listSubjects());
	t.is(subjects.length, 2, 'two subject');
	t.is(subjects[0], firstSubject);
	t.is(subjects[1], secondSubject);
});

test('listSubjects() returns subjects for specified tree', (t) => {
	const { instance, treeModel } = t.context;
	const secondTreeModel = TreeModelMock({ id: 'second' });

	const firstSubject = instance.addSubject(treeModel);
	const secondSubject = instance.addSubject(secondTreeModel);

	t.is(Array.from(instance.listSubjects(treeModel)).length, 1);
	t.is(Array.from(instance.listSubjects(treeModel))[0], firstSubject);

	t.is(Array.from(instance.listSubjects(secondTreeModel)).length, 1);
	t.is(Array.from(instance.listSubjects(secondTreeModel))[0], secondSubject);
});

test('removeSubject() removes subject by ID', (t) => {
	const { instance, treeModel } = t.context;
	const firstSubject = instance.addSubject(treeModel);
	const secondSubject = instance.addSubject(treeModel);
	const removedSubject = instance.removeSubject(firstSubject.getId());
	t.is(removedSubject, firstSubject);

	const subjects = Array.from(instance.listSubjects());
	t.is(subjects.length, 1, 'one subject remaining');
	t.is(subjects[0], secondSubject, 'second subject still there');
});

test('removeSubject() emits `subject.remove` event with removed subject model', (t) => {
	const { instance, treeModel } = t.context;
	let actual = null;
	instance.once('subject.remove', (subject) => {
		actual = subject;
	});
	const subject = instance.addSubject(treeModel);
	instance.removeSubject(subject.getId());
	t.is(actual, subject);
});
