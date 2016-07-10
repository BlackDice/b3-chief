import stampit from 'stampit';
import invariant from 'invariant';
import { oneLine } from 'common-tags';
import Promise from 'any-promise';

const FirebaseAdapter = stampit.compose({
	initializers: [initializeFirebaseAdapter],
	methods: { sync },
});

function initializeFirebaseAdapter({ chief, firebaseRef }) {
	invariant(firebaseRef, oneLine`
		'The Firebase adapter is expecting firebaseRef specified in options object.'
	`);

	this.chief = chief;
	this.firebaseRef = firebaseRef;
}

function sync() {

	const treesRef = this.firebaseRef.child('trees');

	const loadTrees = () => (
		new Promise((resolve) => treesRef.once('value', (treesSnapshot) => {
			if (!treesSnapshot.exists()) {
				return resolve();
			}

			const trees = treesSnapshot.val();
			const treeModels = Object.values(trees).map(deserializeTree, this);

			for (const treeModel of treeModels) {
				this.chief.addTree(treeModel);
				watchTree(treeModel);
			}

			return resolve();
		}))
	);

	function loadSubjects() {
		return Promise.resolve();
	}

	const saveTree = (treeModel) => (
		treesRef.child(treeModel.getId()).set(serializeTree(treeModel))
	);

	function watchTree(treeModel) {
		saveTree(treeModel);
		treeModel.onUpdate(() => saveTree(treeModel));
	}

	const watchForChanges = () => {
		this.chief.on('tree.add', watchTree);
	};

	return Promise.all([
		loadTrees(),
		loadSubjects(),
	]).then(watchForChanges);
}

function serializeTree(treeModel) {
	const nodes = treeModel.listNodes();
	const rootNode = treeModel.getRootNode();
	return {
		id: treeModel.getId(),
		name: treeModel.getName(),
		description: treeModel.getDescription(),
		rootNodeId: rootNode && rootNode.getId(),
		nodes: nodes.map(serializeTreeNode),
		nodeChildren: nodes.reduce(serializeNodeChildren, {}),
	};
}

function serializeTreeNode(nodeModel) {
	return {
		id: nodeModel.getId(),
		name: nodeModel.getName(),
		properties: nodeModel.getProperties(),
	};
}

function serializeNodeChildren(result, nodeModel) {
	const children = nodeModel.getChildren();
	if (children.length === 0) {
		return result;
	}
	const childrenId = children.map((childNode) => childNode.getId());
	return { ...result, [nodeModel.getId()]: childrenId };
}

function deserializeTree({ id, name, description, rootNodeId, nodes, nodeChildren }) {
	const treeModel = this.chief.createTree(id);

	treeModel.setName(name);
	treeModel.setDescription(description);

	for (const node of loopIndexedObject(nodes)) {
		const nodeModel = treeModel.createNode(
			node.name, node.parameters, node.id
		);
		treeModel.addNode(nodeModel);
	}

	const rootNode = treeModel.getNode(rootNodeId);
	if (rootNode !== null) {
		treeModel.setRootNode(rootNode);
	}

	deserializeTreeChildren(treeModel, nodeChildren);

	return treeModel;
}

function deserializeTreeChildren(treeModel, children = null) {
	if (children === null) {
		return;
	}

	for (const parentNodeId of Object.keys(children)) {
		const parentNode = treeModel.getNode(parentNodeId);
		const nodeChildren = children[parentNodeId];

		for (const childId of loopIndexedObject(nodeChildren)) {
			const childNode = treeModel.getNode(childId);
			parentNode.addChild(childNode);
		}
	}
}

function *loopIndexedObject(obj = null) {
	if (obj === null) {
		return;
	}

	const indices = Object.keys(obj).sort();
	for (const index of indices) {
		yield obj[index];
	}
}

export default FirebaseAdapter;
