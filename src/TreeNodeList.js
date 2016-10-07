/**
 * @module Chief
 */

import stampit from 'stampit'
import warning from 'warning'
import invariant from 'invariant'
import { oneLine } from 'common-tags'

import setupModelList from './core/ModelList'

import setupNodeModel from './NodeModel'

const NodeList = stampit({
	initializers: function initializeNodeList(treeId) {
		const NodeModel = setupNodeModel(this.store, treeId)

		const nodesSelector = this.store.selectors.nodes(treeId)

		const nodeList = setupModelList(NodeModel, this.store.select(nodesSelector))
		nodeList.attachCountProperty(this, 'nodeCount')

		Reflect.defineProperty(this, 'nodeList', { get: () => nodeList })
	},
	methods: {
		createNode,
		addNode,
		hasNode,
		getNode,
		destroyNode,
		listNodes,
	},
}).compose()

/**
 * Create a new node based on passed data.
 * Useful to override when node model needs to be extended.
 * @param {Node} node
 * @return {NodeModel}
 */
function addNode(node) {
	return this.nodeList.create(node)
}

/**
 * Creates a new node and adds it to the list.
 * @param {Identity} behaviorId
 * @param {BehaviorConfig=} behaviorConfig
 * @return {NodeModel} created tree
 */
function createNode(behaviorId, behaviorConfig = null) {
	invariant(behaviorId, oneLine`
		Method createNode is expecting a behavior to be used.
	`)

	return this.addNode({
		behaviorId,
		behaviorConfig,
	})
}

/**
 * Checks if node by specified ID exists in the list.
 * @param {Identity} nodeId
 * @return {Boolean}
 */
function hasNode(nodeId) {
	return this.nodeList.has(nodeId)
}

/**
 * Returns node model by specified ID
 * @param  {Identity} nodeId
 * @return {NodeModel} Returns NULL if node not found
 */
function getNode(nodeId) {
	return this.nodeList.get(nodeId)
}

/**
 * Removes node by specified ID from the list.
 * @param {Identity} nodeId
 */
function destroyNode(nodeId) {
	const nodeModel = this.getNode(nodeId)

	if (nodeModel === null) {
		warning(false, oneLine`
			Trying to remove node with id %s that is not on the list.
		`, nodeId)
		return
	}

	nodeModel.destroy()
}

/**
 * Returns list of existing nodes.
 * @return {NodeModel[]}
 */
function listNodes() {
	return this.nodeList.getAll()
}

export default NodeList
