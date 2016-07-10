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
	};
}

function serializeTreeNode(nodeModel) {
	const children = nodeModel.getChildren();
	return {
		id: nodeModel.getId(),
		name: nodeModel.getName(),
		children: children.map((childNode) => childNode.getId()),
	};
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

	for (const parentNodeId of Object.keys(nodeChildren)) {
		const parentNode = treeModel.getNode(parentNodeId);
		const children = nodeChildren[parentNodeId];

		for (const childId of loopIndexedObject(children)) {
			const childNode = treeModel.getNode(childId);
			parentNode.addChild(childNode);
		}
	}

	const rootNode = treeModel.getNode(rootNodeId);
	treeModel.setRootNode(rootNode);

	return treeModel;
}

function *loopIndexedObject(obj) {
	const indices = Object.keys(obj).sort();
	for (const index of indices) {
		yield obj[index];
	}
}

export default FirebaseAdapter;
