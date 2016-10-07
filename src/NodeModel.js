/**
 * @module Chief
 */
import { methods } from 'stampit'

import { Node } from './types'

import Model from './core/Model'
import Disposable from './core/Disposable'
import { createUid } from './core/Uid'

export default function setup(store, treeId) {
	const Adapter = methods({
		set(property, value) {
			store.actions.updateTreeNode({
				nodeId: this.getId(),
				treeId,
				property,
				value,
			})
		},
		getChildIndex(dataSource) {
			return dataSource().childIndex || 0
		},
	})

	const nodesSelector = store.selectors.nodes(treeId)

	return Model(Node, Adapter)
		.compose(Disposable)
		.init(function initializeNodeModel() {
			const selector = (state) => (
				nodesSelector(state)[this.identity]
			)
			this.dataSource = store.select(selector)
		})
		.statics({
			create(node) {
				const id = createUid('Node')

				store.actions.addTreeNode({
					treeId,
					node: { id, ...node },
				})

				return this(id)
			},
			destroy(nodeId) {
				store.actions.removeTreeNode({ treeId, nodeId })
			},
		})
		.methods({
			changeParent(parentId) {
				store.actions.updateTreeNode({
					treeId,
					nodeId: this.getId(),
					property: 'parentId',
					value: parentId,
				})
			},
			changeChildIndex(childIndex) {
				store.actions.updateTreeNode({
					treeId,
					nodeId: this.getId(),
					property: 'childIndex',
					value: childIndex,
				})
			},
			destroy() {
				store.actions.removeTreeNode({ treeId, nodeId: this.getId() })
			},
			toString() {
				return `${this.getTitle() || this.getBehaviorId()} [${this.getId()}]`
			},
		})
}
