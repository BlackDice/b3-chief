/**
 * @module Chief
 */
import { methods } from 'stampit'
import { oneLine } from 'common-tags'

import { Subject } from './types'
import MemoryModel from './MemoryModel'

import Model from './core/Model'
import Disposable from './core/Disposable'
import { createUid } from './core/Uid'

export default function setup(store) {
	const Adapter = methods({
		set(property, value) {
			store.actions.updateSubject({
				id: this.getId(),
				property,
				value,
			})
		},
		getMemories() {
			throw new Error(oneLine`
				Collection of memories of subject cannot be directly read.
				Use respective methods (getSubjectMemory, getTreeMemory, getNodeMemory).
			`)
		},
		setMemories() {
			throw new Error(oneLine`
				Collection of memories of subject cannot be directly modified.
				Use respective methods (getSubjectMemory, getTreeMemory, getNodeMemory).
			`)
		},
	})

	function getSubjectMemory() {
		return MemoryModel({
			store,
			subjectId: this.identity,
			memoryId: this.identity,
		})
	}

	function getTreeMemory(treeId) {
		return MemoryModel({
			store,
			subjectId: this.identity,
			memoryId: treeId,
		})
	}

	function getNodeMemory(nodeId, treeId) {
		return MemoryModel({
			store,
			subjectId: this.identity,
			memoryId: `${treeId}_${nodeId}`,
		})
	}

	return Model(Subject, Adapter)
		.compose(Disposable)
		.init(function initializeSubjectModel() {
			const selector = (state) => (
				store.selectors.subjects(state)[this.identity]
			)
			this.dataSource = store.select(selector)
		})
		.statics({
			create(subject) {
				const id = createUid('Subject')

				store.actions.addSubject({
					id,
					...subject,
				})

				return this(id)
			},
			destroy(identity) {
				store.actions.removeSubject(identity)
			},
		})
		.methods({
			getSubjectMemory,
			getTreeMemory,
			getNodeMemory,
			destroy() {
				store.actions.removeSubject(this.getId())
			},
			toString() {
				return `${this.getId()} [${this.getTreeId()}]`
			},
		})
}
