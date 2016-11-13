/**
 * @module Chief
 */

import { compose } from 'stampit'
import warning from 'warning'
import invariant from 'invariant'
import { oneLine } from 'common-tags'

import Store from './Store'
import BehaviorList from './BehaviorList'
import setupModelList from './core/ModelList'
import setupTreeModel from './TreeModel'

import { BEHAVIOR_TYPE } from './const'

const TreeList = compose(
	Store, BehaviorList, {
		init: initializeTreeList,
		methods: {
			createTree,
			addTree,
			hasTree,
			getTree,
			destroyTree,
			listTrees,
		},
	},
)

const bList = Symbol('list of trees')

function initializeTreeList() {
	const getBehaviorMaxChildren = (behaviorId) => {
		const behavior = this.getBehavior(behaviorId)
		if (behavior === null) {
			return 0
		}
		switch (behavior.getType()) {
		case BEHAVIOR_TYPE.LEAF: return 0
		case BEHAVIOR_TYPE.SUBTREE: return 0
		case BEHAVIOR_TYPE.DECORATOR: return 1
		default: return behavior.getMaxChildren() || Infinity
		}
	}

	const TreeModel = setupTreeModel(this.store).methods({ getBehaviorMaxChildren })

	this[bList] = setupModelList(
		TreeModel,
		this.store.select(this.store.selectors.trees),
	)
	this[bList].attachCountProperty(this, 'treeCount')
}

/**
 * Create a new tree based on passed option.
 * Useful to override when tree model needs to be extended.
 * @param {Tree} tree
 * @return {TreeModel}
 */
function addTree(tree) {
	return this[bList].create(tree)
}

/**
 * Creates new tree and adds it to the list.
 * @param {String} treeName
 * @param {String=} treeDescription
 * @return {TreeModel} created tree
 */
function createTree(treeName, treeDescription = '') {
	invariant(treeName && treeName.length, oneLine`
		Method createTree is expecting name of tree being added.
	`)

	return this.addTree({
		name: treeName,
		description: treeDescription,
	})
}

/**
 * Checks if tree by specified ID exists in the list.
 * @param {Identity} treeId
 * @return {Boolean}
 */
function hasTree(treeId) {
	return this[bList].has(treeId)
}

/**
 * Returns tree model by specified ID
 * @param  {Identity} treeId
 * @return {TreeModel} Returns NULL if tree not found
 */
function getTree(treeId) {
	return this[bList].get(treeId)
}

/**
 * Removes tree by specified ID from the list.
 * @param  {string} treeId
 */
function destroyTree(treeId) {
	const treeModel = this.getTree(treeId)

	if (treeModel === null) {
		warning(false, oneLine`
			Trying to remove tree with id %s that is not on the list.
		`, treeId)
	} else {
		treeModel.destroy()
	}
}

/**
 * Returns list of existing trees.
 * @return {TreeModel[]}
 */
function listTrees() {
	return this[bList].getAll()
}

export default TreeList
