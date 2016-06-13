import { isFunction } from 'lodash';
import invariant from 'invariant';
import { oneLine } from 'common-tags';

import Model from '../core/Model';
import Memory from '../core/Memory';

const SubjectModel = Model('Subject')
	.getter('id')
	.getter('target')
	.property('treeId')
	.getter('memory', createSubjectMemory)
	.getter('blackboardInterface', createBlackboardInterface)
	.methods({
		getMemoryForTree, getMemoryForNode,
		toString,
	})
;

function getMemoryForTree(tree) {
	invariant(isFunction(tree.getRootNode), oneLine`
		Method subject.getMemoryForTree() is expecting tree model to be specified.
		Occurred when accessing tree memory of subject '%s'
	`, this.getId());

	return this.getMemory().accessTree(tree.getId());
}

function getMemoryForNode(node) {
	invariant(isFunction(node.getTreeId), oneLine`
		Method subject.getMemoryForNode() is expecting node model to be specified.
		Occurred when accessing node memory of subject '%s'
	`, this.getId());

	invariant(node.getTreeId(), oneLine`
		The node '%s' does not have a any tree assigned.
	`, this.getId());

	return this.getMemory().accessTree(node.getTreeId()).accessNode(node.getId());
}

function createBlackboardInterface() {
	const subjectMemory = this.getMemory();

	function findMemory(treeId = null, nodeId = null) {
		let memory = subjectMemory;
		if (treeId !== null) {
			memory = memory.accessTree(treeId);
			if (nodeId !== null) {
				memory = memory.accessNode(nodeId);
			}
		}
		return memory;
	}

	const get = (key, treeId, nodeId) => (
		findMemory(treeId, nodeId).get(key)
	);
	const set = (key, value, treeId, nodeId) => ( // eslint-disable-line max-params
		findMemory(treeId, nodeId).set(key, value)
	);

	return { get, set };
}

function toString() {
	return this.getId();
}

const NodeMemory = Memory;

const TreeMemory = Memory
	.withSubmemory('node', NodeMemory)
	.withDefaults({
		openNodes: () => [],
	})
;

const SubjectMemory = Memory.withSubmemory('tree', TreeMemory);

function createSubjectMemory({ memory }) {
	return SubjectMemory.create(memory);
}

export default SubjectModel;
