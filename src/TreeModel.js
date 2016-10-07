import { methods } from 'stampit'
import { oneLine } from 'common-tags'

import { Tree } from './types'

import Model from './core/Model'
import Disposable from './core/Disposable'
import { createUid } from './core/Uid'

import TreeNodeChildren from './TreeNodeChildren'

export default function setup(store) {
	const Adapter = methods({
		getNodes() {
			throw new Error(oneLine`
				Collection of nodes of tree cannot be directly read.
				Use respective methods (getNode, listNodes) for retrieval.
			`)
		},
		set(property, value) {
			store.actions.updateTree({
				id: this.getId(),
				property,
				value,
			})
		},
		setNodes() {
			throw new Error(oneLine`
				Collection of nodes of tree cannot be directly modified.
				Use respective methods (addNode, removeNode) for modifications.
			`)
		},
	})

	return Model(Tree, Adapter)
		.init(function initializeTreeModel() {
			const selector = (state) => (
				store.selectors.trees(state)[this.identity]
			)
			this.dataSource = store.select(selector)
			this.store = store
		})
		.compose(Disposable, TreeNodeChildren)
		.statics({
			create(tree) {
				const id = createUid('Tree')

				store.actions.addTree({
					id,
					...tree,
				})

				return this(id)
			},
			destroy(identity) {
				store.actions.removeTree(identity)
			},
		})
		.methods({
			destroy() {
				store.actions.removeTree(this.getId())
			},
			toString() {
				return `${this.getName()} [${this.getId()}]`
			},
		})
}
