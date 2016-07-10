import { test } from 'ava';
import pify from 'pify';
import { MockFirebase } from 'mockfirebase';

import Chief from '../src/Chief';

MockFirebase.prototype.set = pify(MockFirebase.prototype.set);

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.firebaseMock = new MockFirebase();
	t.context.firebaseMock.autoFlush();
	t.context.treesRef = t.context.firebaseMock.child('trees');
	t.context.adapter = Chief.adapter.Firebase({
		chief: t.context.instance,
		firebaseRef: t.context.firebaseMock,
	});
});

test('loads stored trees into Chief structures', async (t) => {
	const { adapter, instance, treesRef } = t.context;
	const treeData = {
		id: 'treeId',
		name: 'TEST',
		description: 'Test description',
		rootNodeId: 'rootNodeId',
		nodes: {
			0: { id: 'rootNodeId', name: 'Sequence' },
			1: { id: 'childNodeA', name: 'Wait', parameters: { milliseconds: 10 }},
			2: { id: 'childNodeB', name: 'Succeeder' },
		},
		nodeChildren: {
			rootNodeId: {
				0: 'childNodeA',
				1: 'childNodeB',
			},
		},
	};
	treesRef.child('treeId').set(treeData);
	await adapter.sync();

	const loadedTree = instance.getTree('treeId');
	t.truthy(loadedTree);
	t.is(loadedTree.getId(), 'treeId');

	const rootNode = loadedTree.getRootNode();
	t.truthy(rootNode);
	t.is(rootNode.getId(), 'rootNodeId');
	t.is(rootNode.getName(), 'Sequence');

	const nodes = loadedTree.listNodes();
	t.is(nodes.length, 3);
	t.is(nodes[0].getId(), 'rootNodeId');
	t.is(nodes[2].getName(), 'Succeeder');

	const rootNodeChildren = loadedTree.getNode('rootNodeId').getChildren();
	t.is(rootNodeChildren.length, 2);
	t.is(rootNodeChildren[0].getId(), 'childNodeA');
	t.is(rootNodeChildren[1].getId(), 'childNodeB');
});

test('stores serialized tree model and watches for changes', async (t) => {
	const { adapter, instance, treesRef } = t.context;
	await adapter.sync();
	const tree = instance.addTree(instance.createTree());
	const rootNode = tree.setRootNode(tree.createNode('Sequence'));
	const childNode = tree.addNode(tree.createNode('Failer'));
	rootNode.addChild(childNode);

	const treeRef = treesRef.child(tree.getId());

	const savedTree = treeRef.getData();
	t.truthy(savedTree);
	t.is(savedTree.id, tree.getId());
	t.is(savedTree.rootNodeId, rootNode.getId());
	t.is(savedTree.nodes[0].id, rootNode.getId());
	t.is(savedTree.nodes[1].id, childNode.getId());
	t.is(savedTree.nodes[0].children[0], childNode.getId());

	tree.setName('TEST');
	const updatedTree = treeRef.getData();
	t.is(updatedTree.name, 'TEST');
});
