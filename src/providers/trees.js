import t from 'tcomb'
import { Tree, Identity, Node, NodeDictionary } from '../types'

export const stateType = t.dict(Identity, Tree, 'TreeDictionary')

export const initialState = {}

export const actions = {
	addTree: Tree,
	removeTree: Identity,
	updateTree: t.interface({
		id: Identity,
		property: t.String,
		value: t.Any,
	}),
	replaceTrees: stateType,
	addTreeNode: t.interface({
		treeId: Identity,
		node: Node,
	}),
	removeTreeNode: t.interface({
		treeId: Identity,
		nodeId: Identity,
	}),
	updateTreeNode: t.interface({
		treeId: Identity,
		nodeId: Identity,
		property: t.String,
		value: t.Any,
	}),
}

export const reducers = {
	addTree(state, { payload: tree }) {
		return t.update(state, {
			[tree.id]: { $set: tree },
		})
	},
	removeTree(state, { payload: treeId }) {
		return t.update(state, {
			$remove: [treeId],
		})
	},
	updateTree(state, { payload: { id, property, value }}) {
		return t.update(state, {
			[id]: { [property]: { $set: value }},
		})
	},
	replaceTrees(state, { payload: trees }) {
		return { ...trees }
	},
	addTreeNode(state, { payload: { treeId, node }}) {
		return t.update(ensureNodes(state, treeId), {
			[treeId]: { nodes: { [node.id]: { $set: node }}},
		})
	},
	removeTreeNode(state, { payload: { treeId, nodeId }}) {
		return t.update(ensureNodes(state, treeId), {
			[treeId]: { nodes: { $remove: [nodeId] }},
		})
	},
	updateTreeNode(state, { payload: { treeId, nodeId, property, value }}) {
		return t.update(ensureNodes(state, treeId), {
			[treeId]: { nodes: { [nodeId]: { [property]: { $set: value }}}},
		})
	},
}

function ensureNodes(state, treeId) {
	const tree = state[treeId]
	if (NodeDictionary.is(tree.nodes)) {
		return state
	}
	return t.update(state, {
		[treeId]: { $merge: { nodes: {}}},
	})
}

export const applyForSelectors = (selectors) => ({
	...selectors,
	trees: (state) => state.trees,
	nodes: (treeId) => (state) => state.trees[treeId].nodes,
})
