import { test } from 'ava';

import Chief from '../src/Chief';

import Subject from '../src/model/Subject';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.treeModel = t.context.instance.createTree('Sequence');
});

test('has separate memory for each subject', (t) => {
	const subject = Subject.create();
	const secondSubject = Subject.create();
	t.not(subject.getMemory(), secondSubject.getMemory());
});

test('memory can be initialized with data passed to subject', (t) => {
	const subject = Subject.create({ memory: { test: 'foo' }});
	t.is(subject.getMemory().get('test'), 'foo');
});

test('tree memory has openNodes array correctly specified in defaults', (t) => {
	const { treeModel } = t.context;
	const subject = Subject.create();

	const treeMemory1 = subject.getMemoryForTree(treeModel);
	t.is(typeof treeMemory1.get('openNodes'), 'object');

	const treeMemory2 = subject.getMemory().accessTree('someTree');
	t.not(treeMemory2.get('openNodes'), treeMemory1.get('openNodes'));
});

test('getMemoryForTree() is expecting tree model', (t) => {
	const subject = Subject.create();
	t.throws(() => subject.getMemoryForTree({}), /expecting tree model/);
});

test('getMemoryForTree() returns submemory for specified tree model', (t) => {
	const { treeModel } = t.context;

	const subject = Subject.create();
	const treeMemory = subject.getMemoryForTree(treeModel);
	t.is(treeMemory, subject.getMemory().accessTree(treeModel.getId()));

	const secondSubject = Subject.create();
	const secondTreeMemory = secondSubject.getMemoryForTree(treeModel);
	t.not(treeMemory, secondTreeMemory);
});

test('getMemoryForNode() is expecting node model', (t) => {
	const subject = Subject.create();
	t.throws(() => subject.getMemoryForNode({}), /expecting node model/);
});

test('getMemoryForNode() returns submemory for specified node model within tree', (t) => {
	const { treeModel } = t.context;
	const rootNode = treeModel.getRootNode();

	const subject = Subject.create();
	const nodeMemory = subject.getMemoryForNode(rootNode);
	t.is(nodeMemory, subject.getMemory().accessTree(treeModel.getId()).accessNode(rootNode.getId())); // eslint-disable-line max-len

	const secondSubject = Subject.create();
	const secondNodeMemory = secondSubject.getMemoryForNode(rootNode);
	t.not(nodeMemory, secondNodeMemory);
});

test('getBlackboardInterface() returns interface with get/set methods for use in B3', (t) => {
	const subject = Subject.create({ memory: { test: true }});
	const iface = subject.getBlackboardInterface();
	t.is(typeof iface.get, 'function');
	t.is(typeof iface.set, 'function');

	t.is(iface.get('test'), true);
	iface.set('test', 1);
	t.is(subject.getMemory().get('test'), 1);

	iface.set('test', 2, 'treeId');
	t.deepEqual(subject.getMemory().accessTree('treeId').get('test'), 2);

	iface.set('test', 3, 'treeId', 'nodeId');
	t.is(subject.getMemory().accessTree('treeId').accessNode('nodeId').get('test'), 3);

	subject.getMemory().accessTree('treeId').accessNode('nodeId').set('test', 4);
	t.is(iface.get('test', 'treeId', 'nodeId'), 4);
});

test('toString() contains id of subject', (t) => {
	const { instance, treeModel } = t.context;
	const subject = instance.addSubject(treeModel);
	t.true(subject.toString().indexOf(subject.getId()) >= 0);
});
