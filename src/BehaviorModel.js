import { methods } from 'stampit'
import { oneLine } from 'common-tags'

import { Behavior } from './types'
import { BEHAVIOR_TYPE } from './const'

import Model from './core/Model'
import Disposable from './core/Disposable'
import { createUid } from './core/Uid'

const initialDefinition = `{
	tick({ status }) {
		return status.ERROR
	}
}`

export default function setup({ store }) {
	const Adapter = methods({
		set(property, value) {
			store.actions.updateBehavior({
				id: this.getId(),
				property,
				value,
			})
		},
		setMaxChildren(value, dataSource) {
			const behavior = dataSource()
			if (behavior.type !== BEHAVIOR_TYPE.COMPOSITE) {
				throw new Error(oneLine`
					Property maxChildren can be set for composite behaviors only.
				`)
			}
		},
		setBehaviorId() {
			throw new Error(oneLine`
				Changing behavior of the node ${this.getId()} can lead to unforseen consequences
				so it's not allowed.
			`)
		},
	})

	return Model(Behavior, Adapter)
		.init(function initializeBehaviorModel(id) {
			const selector = (state) => (
				store.selectors.behaviors(state)[id]
			)
			this.dataSource = store.select(selector)
		})
		.compose(Disposable)
		.statics({
			create(behavior) {
				const id = createUid('Behavior')

				store.actions.addBehavior({
					id,
					definition: initialDefinition,
					...behavior,
				})

				return this(id)
			},
			destroy(identity) {
				store.actions.removeBehavior(identity)
			},
		})
		.methods({
			destroy() {
				store.actions.removeBehavior(this.getId())
			},
			toString() {
				return `${this.getName()} [${this.getId()}]`
			},
		})
		.propertyDescriptors({
			isNative: { value: false },
		})
}
